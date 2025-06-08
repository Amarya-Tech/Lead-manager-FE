import { Link } from "react-router-dom";
import "./css/SideBar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Lead Manager</h2>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/update-leads">Update Leads</Link>
        <Link to="/lead-communication">Lead Communication</Link>
        <Link to="/user-profile">User</Link>
      </nav>
    </div>
  );
}
