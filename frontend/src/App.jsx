import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TreeView from './pages/TreeView';
import MemberDetail from './pages/MemberDetail';
import MemberForm from './pages/MemberForm';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/tree" element={<><Navbar /><TreeView /></>} />
        <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        <Route path="/members/:id" element={<><Navbar /><MemberDetail /></>} />
        <Route path="/members/new" element={<PrivateRoute><Navbar /><MemberForm /></PrivateRoute>} />
        <Route path="/members/:id/edit" element={<PrivateRoute><Navbar /><MemberForm mode="edit" /></PrivateRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
