import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  Panel,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link } from 'react-router-dom';
import dagre from '@dagrejs/dagre';
import { toPng } from 'html-to-image';
import { relationshipsAPI, membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import Avatar from '../components/Avatar';
import { TreeIcon, DownloadIcon, LinkIcon, PlusIcon } from '../components/Icons';

// Node dimensions
const NODE_W = 240;
const NODE_H = 120;

// Custom Node for family members
function MemberNode({ data }) {
  return (
    <div className="member-node-container">
      <Handle type="target" position={Position.Top}    id="t-top"    className="custom-handle" />
      <Handle type="target" position={Position.Left}   id="t-left"   className="custom-handle" />
      <Handle type="source" position={Position.Left}   id="s-left"   className="custom-handle" />
      <Handle type="target" position={Position.Right}  id="t-right"  className="custom-handle" />
      <Handle type="source" position={Position.Right}  id="s-right"  className="custom-handle" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="custom-handle" />

      <Link to={`/members/${data.id}`} style={{ textDecoration: 'none' }}>
        <div className={`clean-tree-node ${data.gender} ${!data.is_alive ? 'deceased' : ''}`}>
          <div className="node-photo-col">
            {data.photo_url ? (
              <Avatar src={data.photo_url} name={data.full_name} gender={data.gender} size="md" />
            ) : (
              <Avatar name={data.full_name} gender={data.gender} size="md" />
            )}
          </div>
          <div className="node-info-col">
            <p className="node-name">{data.full_name}</p>
            {data.nickname && <p className="node-sub">Panggilan: {data.nickname}</p>}
            {data.occupation && <p className="node-role-tag">{data.occupation}</p>}
            {!data.is_alive && <span className="node-deceased-badge">Alm.</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}

function UnionNode() {
  return (
    <div style={{ width: 1, height: 1, position: 'relative' }}>
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ background: '#1b4332', width: 6, height: 6 }} />
      <Handle type="target" position={Position.Top}    id="t-top"    style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left}   id="t-left"   style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right}  id="t-right"  style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { member: MemberNode, union: UnionNode };

function autoLayout(allNodes, visualEdges, spouseEdgesList = [], originalEdges = []) {
  if (!allNodes.length) return allNodes;

  const g = new dagre.graphlib.Graph({ directed: true, multigraph: true });
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 140,
    marginx: 40,
    marginy: 40,
    align: 'UL',
  });

  const SPOUSE_GAP = 60;
  const COUPLE_W = NODE_W * 2 + SPOUSE_GAP;

  const memberNodes = allNodes.filter(n => n.type !== 'union');
  const unionNodes = allNodes.filter(n => n.type === 'union');

  // 1. Map spouses to their union
  const memberToUnion = {};
  unionNodes.forEach(u => {
    memberToUnion[u.data.spouse1] = u.id;
    memberToUnion[u.data.spouse2] = u.id;
    g.setNode(u.id, { width: COUPLE_W, height: NODE_H });
  });

  // 2. Add single members to Dagre
  memberNodes.forEach(m => {
    if (!memberToUnion[m.id]) {
      g.setNode(m.id, { width: NODE_W, height: NODE_H });
    }
  });

  // 3. Add edges (only parent -> child)
  visualEdges.forEach(e => {
    const isSpouseEdge = e.label === 'spouse' || e.isSpouse;
    if (isSpouseEdge) return;

    let s = e.source;
    if (memberNodes.find(n => n.id === e.source) && memberToUnion[e.source]) {
      s = memberToUnion[e.source];
    }
    
    let t = memberToUnion[e.target] || e.target;

    if (s !== t) {
      g.setEdge(s, t);
    }
  });

  dagre.layout(g);

  const posMap = {};
  const parentsOf = {};
  memberNodes.forEach(m => { parentsOf[m.id] = []; });
  originalEdges.forEach(e => {
    if (e.label === 'spouse') return;
    if (!parentsOf[e.target]) parentsOf[e.target] = [];
    if (!parentsOf[e.target].includes(e.source)) parentsOf[e.target].push(e.source);
  });

  unionNodes.forEach(u => {
    const pos = g.node(u.id);
    if (!pos) return;
    
    const startX = pos.x - COUPLE_W / 2;
    const startY = pos.y - NODE_H / 2;
    
    let s1 = u.data.spouse1;
    let s2 = u.data.spouse2;

    function getParentAvgX(memberId) {
       const parents = parentsOf[memberId] || [];
       if (parents.length === 0) return pos.x;
       let sum = 0, count = 0;
       parents.forEach(pId => {
          const pUnion = memberToUnion[pId];
          const pNodeId = pUnion || pId;
          const pDagrePos = g.node(pNodeId);
          if (pDagrePos) {
             sum += pDagrePos.x;
             count++;
          }
       });
       return count > 0 ? sum / count : pos.x;
    }

    const avgX1 = getParentAvgX(s1);
    const avgX2 = getParentAvgX(s2);

    if (avgX1 > avgX2) {
       const temp = s1;
       s1 = s2;
       s2 = temp;
    }

    posMap[s1] = { x: startX, y: startY };
    posMap[s2] = { x: startX + NODE_W + SPOUSE_GAP, y: startY };
    posMap[u.id] = { x: pos.x - 4, y: startY + NODE_H - 30 }; 
  });

  memberNodes.forEach(m => {
    if (!memberToUnion[m.id]) {
      const pos = g.node(m.id);
      if (pos) {
        posMap[m.id] = { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 };
      }
    }
  });

  const allXs = Object.values(posMap).map(p => p.x);
  if (allXs.length > 0) {
    const minX = Math.min(...allXs);
    const maxX = Math.max(...allXs);
    const offset = (minX + maxX) / 2;
    Object.keys(posMap).forEach(k => { posMap[k].x -= offset; });
  }

  const positionedNodes = allNodes.map(n => ({
    ...n,
    position: posMap[n.id] || { x: 0, y: 0 }
  }));

  // Clean, non-neon branch lines
  visualEdges.forEach(e => {
    const isUnionEdge = e.id?.startsWith('edge_union_') || e.source?.startsWith('union_');
    const isSpouseEdge = e.label === 'spouse' || e.isSpouse;

    if (isUnionEdge) {
      e.type = 'step';
      e.sourceHandle = 's-bottom';
      e.targetHandle = 't-top';
      e.style = { stroke: '#1b4332', strokeWidth: 2 };
      e.markerEnd = { type: MarkerType.ArrowClosed, color: '#1b4332' };
    } else if (isSpouseEdge) {
      e.type = 'straight';
      const ps = posMap[e.source], pt = posMap[e.target];
      if (ps && pt) {
        e.sourceHandle = ps.x < pt.x ? 's-right' : 's-left';
        e.targetHandle = ps.x < pt.x ? 't-left' : 't-right';
      }
      e.style = { stroke: '#9a3412', strokeWidth: 2 };
      e.markerEnd = null;
    } else {
      e.type = 'step';
      e.sourceHandle = 's-bottom';
      e.targetHandle = 't-top';
      e.style = { stroke: '#57534e', strokeWidth: 2 };
      e.markerEnd = { type: MarkerType.ArrowClosed, color: '#57534e' };
    }
  });

  return positionedNodes;
}

function DownloadButton() {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = 1920;
    const imageHeight = 1080;
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    const viewportElem = document.querySelector('.react-flow__viewport');
    if (!viewportElem) return;
    
    toPng(viewportElem, {
      backgroundColor: '#fcfbf9',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', 'silsilah-keluarga.png');
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  return (
    <Panel position="top-right">
      <button className="btn btn-secondary btn-sm" onClick={onClick}>
        <DownloadIcon size={16} />
        <span>Unduh Bagan</span>
      </button>
    </Panel>
  );
}

export default function TreeView() {
  const { user } = useAuthStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Relation form state
  const [members, setMembers] = useState([]);
  const [showRelForm, setShowRelForm] = useState(false);
  const [relFormType, setRelFormType] = useState('parent_child');
  const [relForm, setRelForm] = useState({ parent_id: '', child_id: '', relationship_type: 'biological' });
  const [relSaving, setRelSaving] = useState(false);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await relationshipsAPI.getTree();
      let rawNodes = res.data.nodes || [];
      const originalEdges = res.data.edges || [];
      let rawEdges = [...originalEdges];

      const spouseEdges = originalEdges.filter(e => e.label === 'spouse');
      const unionNodes = [];
      const newLayoutEdges = [];
      const edgesToRemove = new Set();
      
      spouseEdges.forEach(se => {
         const uId = `union_${se.id}`;
         unionNodes.push({
           id: uId,
           type: 'union',
           data: { spouse1: se.source, spouse2: se.target },
           position: {x: 0, y: 0}
         });

         const children1 = originalEdges.filter(e => e.source === se.source && e.label !== 'spouse').map(e => e.target);
         const children2 = originalEdges.filter(e => e.source === se.target && e.label !== 'spouse').map(e => e.target);
         const commonChildren = children1.filter(c => children2.includes(c));

         commonChildren.forEach(childId => {
            const e1 = originalEdges.find(e => e.source === se.source && e.target === childId);
            const e2 = originalEdges.find(e => e.source === se.target && e.target === childId);
            if(e1) edgesToRemove.add(e1.id);
            if(e2) edgesToRemove.add(e2.id);
            
            newLayoutEdges.push({
               id: `edge_${uId}_${childId}`,
               source: uId,
               target: childId,
               type: 'step',
               markerEnd: { type: MarkerType.ArrowClosed, color: '#1b4332' },
               style: { stroke: '#1b4332', strokeWidth: 2 }
            });
         });
      });

      rawEdges = rawEdges.filter(e => !edgesToRemove.has(e.id));
      const visualEdges = [...rawEdges, ...newLayoutEdges];
      const allVisualNodes = [...rawNodes, ...unionNodes];

      setTimeout(() => {
        const layoutedNodes = autoLayout(allVisualNodes, visualEdges, spouseEdges, originalEdges);
        setNodes(layoutedNodes);
        setEdges(visualEdges);
        setLoading(false);
      }, 100);

    } catch (err) {
      console.error(err);
      setError('Gagal memuat pohon silsilah keluarga');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
    if (user) {
      membersAPI.list().then(res => setMembers(res.data.data || []));
    }
  }, [user, loadTree]);

  const handleAddRelation = async (e) => {
    e.preventDefault();
    if (!relForm.parent_id || !relForm.child_id) return;
    setRelSaving(true);
    try {
      if (relFormType === 'spouse') {
         await relationshipsAPI.create({
            parent_id: relForm.parent_id,
            child_id: relForm.child_id,
            relationship_type: 'spouse'
         });
      } else {
         await relationshipsAPI.create(relForm);
      }
      setShowRelForm(false);
      setRelForm({ parent_id: '', child_id: '', relationship_type: 'biological' });
      await loadTree();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menambahkan relasi keluarga');
    } finally {
      setRelSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page loading-container">
        <div className="spinner large"></div>
        <p>Menyusun bagan silsilah keluarga...</p>
      </div>
    );
  }

  return (
    <div className="tree-page">
      <div className="tree-toolbar">
        <div className="tree-toolbar-left">
          <div className="tree-toolbar-title">
            <TreeIcon size={20} />
            <h2>Bagan Silsilah Keluarga</h2>
          </div>
          <span className="tree-count-badge">
            {nodes.filter(n => n.type !== 'union').length} Anggota
          </span>
        </div>

        <div className="tree-toolbar-right">
          {user && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowRelForm(!showRelForm)}
            >
              <LinkIcon size={16} />
              <span>{showRelForm ? 'Tutup Formulir' : 'Hubungkan Relasi'}</span>
            </button>
          )}
          {user && (
            <Link to="/members/new" className="btn btn-secondary btn-sm">
              <PlusIcon size={16} />
              <span>Tambah Anggota</span>
            </Link>
          )}
        </div>
      </div>

      {showRelForm && user && (
        <div className="rel-form-panel">
          <h3>Hubungkan Tali Hubungan Keluarga</h3>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Bentuk Hubungan</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="relType"
                  checked={relFormType === 'parent_child'}
                  onChange={() => setRelFormType('parent_child')}
                />
                <span>Orang Tua & Anak</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="relType"
                  checked={relFormType === 'spouse'}
                  onChange={() => setRelFormType('spouse')}
                />
                <span>Suami & Istri</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleAddRelation} className="rel-form-row">
            <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
              <label>{relFormType === 'spouse' ? 'Pasangan 1' : 'Pihak Orang Tua'}</label>
              <select
                value={relForm.parent_id}
                onChange={e => setRelForm(p => ({ ...p, parent_id: e.target.value }))}
                required
              >
                <option value="">Pilih anggota keluarga...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} {m.nickname ? `(${m.nickname})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
              <label>{relFormType === 'spouse' ? 'Pasangan 2' : 'Pihak Anak'}</label>
              <select
                value={relForm.child_id}
                onChange={e => setRelForm(p => ({ ...p, child_id: e.target.value }))}
                required
              >
                <option value="">Pilih anggota keluarga...</option>
                {members
                  .filter(m => m.id !== relForm.parent_id)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} {m.nickname ? `(${m.nickname})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={relSaving}>
              {relSaving ? 'Menyimpan...' : 'Simpan Hubungan'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div>}

      <div className="tree-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="var(--border)" gap={24} size={1} />
          <Controls />
          <DownloadButton />
        </ReactFlow>
      </div>
    </div>
  );
}
