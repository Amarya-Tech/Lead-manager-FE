import { Link } from "react-router-dom";
import "./css/SideBar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Lead Manager</h2>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leads">Leads</Link>
        <Link to="/users">Users</Link>
        <Link to="/user-profile">User Profile</Link>
      </nav>
    </div>
  );
}
