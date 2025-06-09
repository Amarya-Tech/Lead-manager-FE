import { Routes, Route } from "react-router-dom";
import Leads from "./pages/Leads";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LeadsNewPage from "./pages/LeadsCreateNew.js";
import { ToastContainer } from 'react-toastify';
import UserProfilePage from "./pages/UserProfile.js";

function App() {
  return (
    <>
    <Routes>
      <Route path="/dashboard" element={<Leads />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/leads/new" element={<LeadsNewPage />} />
      <Route path="/user-profile" element={<UserProfilePage />} />
    </Routes>
    <ToastContainer position="top-right" />
    </>
  );
}

export default App;