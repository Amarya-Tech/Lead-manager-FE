import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";
import { ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';

// Pages
import Dashboard from "./pages/Dashboard.js";
import Login from "./pages/Login";
import LeadsNewPage from "./components/LeadsCreateNew.js";
import UserProfilePage from "./pages/UserProfile.js";
import Leads from "./pages/Leads.js";
import UserPage from "./pages/Users.js";
import CsvUploadPage from "./components/ImportExcel.js";
import { useAuthStore } from "./apicaller/AuthStore.js";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { jwt } = useAuthStore();
  return jwt ? children : <Navigate to="/login" replace />;
};

// Role-based Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { role, jwt } = useAuthStore();
  const token = jwt;
  const userRole = role.toLowerCase();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles.length &&  !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { jwt } = useAuthStore();

  useEffect(() => {
    if (jwt) setIsAuthenticated(true);
    setLoading(false);
  }, []);


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Public route */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        {/* Authenticated routes */}
        <Route path="/dashboard" element={<ProtectedRoute ><Dashboard /></ProtectedRoute>} />
        <Route path="/leads/*" element={<ProtectedRoute><Leads /></ProtectedRoute>} /> 
        <Route path="/leads/status/:status" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/leads/new" element={<ProtectedRoute><LeadsNewPage /></ProtectedRoute>} />
        <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

        {/* Admin-only route */}
        <Route path="/users" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <UserPage />
          </RoleProtectedRoute>
        } />

         {/* Super Admin-only route */}
        <Route path="/upload-sheet" element={
          <RoleProtectedRoute allowedRoles={['super_admin']}>
            <CsvUploadPage />
          </RoleProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" />
    </>
  );
}

export default App;
