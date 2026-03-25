import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
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

// ── Node dimensions (must match rendered CSS) ──────────────────────────────
const NODE_W = 240;
const NODE_H = 120;

// Custom Node for family members
function MemberNode({ data }) {
  return (
    <div className="member-node-container">
      <Handle type="target" position={Position.Top}    id="t-top"   className="custom-handle" />
      <Handle type="target" position={Position.Left}   id="t-left"  className="custom-handle" />
      <Handle type="source" position={Position.Left}   id="s-left"  className="custom-handle" />
      <Handle type="target" position={Position.Right}  id="t-right" className="custom-handle" />
      <Handle type="source" position={Position.Right}  id="s-right" className="custom-handle" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="custom-handle" />

      <Link to={`/members/${data.id}`} style={{ textDecoration: 'none' }}>
        <div className={`premium-tree-node ${data.gender} ${!data.is_alive ? 'deceased' : ''}`}>
          <div className="premium-node-glass shadow-lg"></div>
          <div className="premium-node-content">
            <div className="premium-node-photo-wrapper">
              {data.photo_url ? (
                <img src={data.photo_url} alt={data.full_name} className="premium-node-img" />
              ) : (
                <div className="premium-node-avatar">
                  {data.gender === 'female' ? '👩' : '👨'}
                </div>
              )}
            </div>
            <div className="premium-node-info">
              <p className="premium-node-name">{data.full_name}</p>
              {data.nickname && <p className="premium-node-nick">"{data.nickname}"</p>}
              {data.occupation && <p className="premium-node-occ">{data.occupation}</p>}
              {!data.is_alive && <span className="premium-node-status">Alm.</span>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function UnionNode() {
  return (
    <div style={{ width: 1, height: 1, position: 'relative' }}>
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ background: '#4f46e5', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Top}    id="t-top"    style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left}   id="t-left"   style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right}  id="t-right"  style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { member: MemberNode, union: UnionNode };

// ─────────────────────────────────────────────────────────────────────────────
// DAGRE-BASED AUTO-LAYOUT (Macro-Node Approach)
// We group spouses into a single "Macro-Node" so dagre places marriage couples
// side-by-side perfectly, rather than stacking them vertically.
// ─────────────────────────────────────────────────────────────────────────────
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
    // Add couple macro-node to Dagre
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
    if (isSpouseEdge) return; // skip horizontal spouse edges in dagre

    // e.source is either a single Member, or a Union
    let s = e.source;
    if (memberNodes.find(n => n.id === e.source) && memberToUnion[e.source]) {
      s = memberToUnion[e.source];
    }
    
    // e.target is ALWAYS a Member
    let t = memberToUnion[e.target] || e.target;

    if (s !== t) {
      g.setEdge(s, t);
    }
  });

  dagre.layout(g);

  // Read back positions and unpack macro-nodes
  const posMap = {};
  
  // Need parent map to determine left/right ordering of spouses
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
    
    // pos is the dagre center of the macro-node
    const startX = pos.x - COUPLE_W / 2;
    const startY = pos.y - NODE_H / 2;
    
    let s1 = u.data.spouse1;
    let s2 = u.data.spouse2;

    // To prevent crossed lines, we sort spouses horizontally based on their incoming parent branches
    function getParentAvgX(memberId) {
       const parents = parentsOf[memberId] || [];
       if (parents.length === 0) return pos.x; // default to center if no parents
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
       // s1's parents are further right, so swap them!
       const temp = s1;
       s1 = s2;
       s2 = temp;
    }

    // Spouse 1 (or the swapped spouse that belongs on the left):
    posMap[s1] = { x: startX, y: startY };
    // Spouse 2 (belongs on the right):
    posMap[s2] = { x: startX + NODE_W + SPOUSE_GAP, y: startY };
    // Union connection point: exactly between spouses near the bottom
    posMap[u.id] = { x: pos.x - 4, y: startY + NODE_H - 30 }; 
  });

  memberNodes.forEach(m => {
    if (!memberToUnion[m.id]) {
      const pos = g.node(m.id);
      if (pos) {
        // Dagre center to Top-Left
        posMap[m.id] = { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 };
      }
    }
  });

  // 5. Center around X=0
  const allXs = Object.values(posMap).map(p => p.x);
  if (allXs.length > 0) {
    const minX = Math.min(...allXs);
    const maxX = Math.max(...allXs);
    const offset = (minX + maxX) / 2;
    Object.keys(posMap).forEach(k => { posMap[k].x -= offset; });
  }

  // Assign positions back to nodes array
  const positionedNodes = allNodes.map(n => ({
    ...n,
    position: posMap[n.id] || { x: 0, y: 0 }
  }));

  // Style edges (strict orthogonal lines)
  visualEdges.forEach(e => {
    const isUnionEdge = e.id?.startsWith('edge_union_') || e.source?.startsWith('union_');
    const isSpouseEdge = e.label === 'spouse' || e.isSpouse;

    if (isUnionEdge) {
      e.type = 'step';
      e.sourceHandle = 's-bottom';
      e.targetHandle = 't-top';
      e.style = { stroke: '#4f46e5', strokeWidth: 3 };
      e.markerEnd = { type: MarkerType.ArrowClosed, color: '#4f46e5' };
    } else if (isSpouseEdge) {
      e.type = 'straight';
      const ps = posMap[e.source], pt = posMap[e.target];
      if (ps && pt) {
        e.sourceHandle = ps.x < pt.x ? 's-right' : 's-left';
        e.targetHandle = ps.x < pt.x ? 't-left' : 't-right';
      }
      e.style = { stroke: '#2dd4bf', strokeWidth: 3 };
      e.markerEnd = null;
    } else {
      // Single parent edge
      e.type = 'step';
      e.sourceHandle = 's-bottom';
      e.targetHandle = 't-top';
      e.style = { stroke: '#4f46e5', strokeWidth: 2 };
      e.markerEnd = { type: MarkerType.ArrowClosed, color: '#4f46e5' };
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
    
    toPng(viewportElem, {
      backgroundColor: '#0f0f1a',
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
      <button className="btn btn-primary btn-sm" onClick={onClick} style={{ background: '#ec4899', borderColor: '#ec4899', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}>
        📸 Simpan PDF / Gambar
      </button>
    </Panel>
  );
}

export default function TreeView() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';



  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Relation form
  const [members, setMembers] = useState([]);
  const [showRelForm, setShowRelForm] = useState(false);
  const [relFormType, setRelFormType] = useState('parent_child'); // 'parent_child' or 'spouse'
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
               markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' },
               style: { stroke: '#4f46e5', strokeWidth: 2 }
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
      setError('Gagal memuat pohon keluarga');
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
      alert(err.response?.data?.error || 'Gagal menambah relasi');
    } finally {
      setRelSaving(false);
    }
  };

  if (loading) return (
    <div className="page loading-state tree-loading">
      <div className="spinner large"></div>
      <p>Memuat pohon keluarga...</p>
    </div>
  );

  return (
    <div className="tree-page">
      <div className="tree-toolbar">
        <div className="tree-toolbar-left">
          <h2>🌳 Pohon Keluarga</h2>
          <span className="tree-count">{nodes.length} anggota</span>
        </div>
        <div className="tree-toolbar-right">
          {user && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowRelForm(!showRelForm)}>
              🔗 {showRelForm ? 'Batal' : 'Tambah Relasi'}
            </button>
          )}
          <Link to="/dashboard" className="btn btn-ghost btn-sm">Daftar Anggota</Link>
        </div>
      </div>

      {showRelForm && user && (
        <div className="rel-form-panel">
          <h3>Tambah Relasi</h3>
          
          <div className="form-group">
            <label>Jenis Relasi</label>
            <div className="radio-group" style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
              <label><input type="radio" checked={relFormType === 'parent_child'} onChange={() => setRelFormType('parent_child')} /> Orang Tua & Anak</label>
              <label><input type="radio" checked={relFormType === 'spouse'} onChange={() => setRelFormType('spouse')} /> Suami & Istri</label>
            </div>
          </div>

          <form onSubmit={handleAddRelation} className="rel-form">
            <div className="form-group">
              <label>{relFormType === 'spouse' ? 'Pasangan 1' : 'Orang Tua'}</label>
              <select value={relForm.parent_id} onChange={e => setRelForm(p => ({ ...p, parent_id: e.target.value }))} required>
                <option value="">-- Pilih --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{relFormType === 'spouse' ? 'Pasangan 2' : 'Anak'}</label>
              <select value={relForm.child_id} onChange={e => setRelForm(p => ({ ...p, child_id: e.target.value }))} required>
                <option value="">-- Pilih --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
            
            {relFormType === 'parent_child' && (
              <div className="form-group">
                <label>Tipe Anak</label>
                <select value={relForm.relationship_type} onChange={e => setRelForm(p => ({ ...p, relationship_type: e.target.value }))}>
                  <option value="biological">Kandung</option>
                  <option value="adopted">Adopsi</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={relSaving}>
              {relSaving ? 'Menyimpan...' : 'Simpan Relasi'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {nodes.length === 0 ? (
        <div className="empty-tree">
          <div className="empty-icon">🌱</div>
          <h3>Pohon keluarga masih kosong</h3>
          <p>Tambahkan anggota keluarga dan buat relasi untuk melihat pohon keluarga</p>
          <div className="empty-tree-actions">
            <Link to="/members/new" className="btn btn-primary">Tambah Anggota</Link>
            <Link to="/dashboard" className="btn btn-ghost">Lihat Semua Anggota</Link>
          </div>
        </div>
      ) : (
        <div className="tree-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
          >
            <Controls />
            <DownloadButton />
            <MiniMap
              nodeColor={(n) => n.data?.gender === 'female' ? '#ec4899' : '#6366f1'}
              style={{ background: '#1e1e2e' }}
            />
            <Background variant="dots" gap={20} size={1} color="#ffffff20" />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
