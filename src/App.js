import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard.js";
import Login from "./pages/Login";
import LeadsNewPage from "./components/LeadsCreateNew.js";
import { ToastContainer } from 'react-toastify';
import UserProfilePage from "./pages/UserProfile.js";
import Leads from "./pages/Leads.js";
import Cookies from 'js-cookie';
import UserPage from "./pages/Users.js";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('jwt'); 
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leads" 
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leads/new" 
          element={
            <ProtectedRoute>
              <LeadsNewPage />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" />
    </>
  );
}

export default App;