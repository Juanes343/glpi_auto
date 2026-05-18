import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import CreateTicket from '../pages/CreateTicket';
import NewTickets from '../pages/NewTickets';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/crear-caso"   element={<CreateTicket />} />
        <Route path="/casos-nuevos" element={<NewTickets />} />
      </Routes>
    </Layout>
  );
}
