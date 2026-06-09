import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Home from '../pages/Home';
import CreateTicket from '../pages/CreateTicket';
import NewTickets from '../pages/NewTickets';

function Private({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"        element={<Login />} />
      <Route path="/"             element={<Private><Home /></Private>} />
      <Route path="/crear-caso"   element={<Private><CreateTicket /></Private>} />
      <Route path="/casos-nuevos" element={<Private><NewTickets /></Private>} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  );
}
