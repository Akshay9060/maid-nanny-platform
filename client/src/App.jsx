import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HelperList from './pages/HelperList';
import HelperProfile from './pages/HelperProfile';
import HouseholdDashboard from './pages/HouseholdDashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/helpers" element={<HelperList />} />
          <Route path="/helpers/:id" element={<HelperProfile />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['household']}>
                <HouseholdDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helper/dashboard"
            element={
              <ProtectedRoute allowedRoles={['helper']}>
                <HelperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
