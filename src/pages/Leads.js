import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/SideBar.js";
import LeadsTable from "../components/LeadsTable.js";
import "./css/Leads.css";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL LEADS");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const navigate = useNavigate();

    const handleNewLead = () => {
      navigate('/leads/new'); 
    };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const filterButtons = [
    { label: "All Leads", value: "ALL LEADS" },
    { label: "Open Leads", value: "OPEN LEADS" },
    { label: "Contacted Leads", value: "CONTACTED LEADS" },
    { label: "Closed Leads", value: "CLOSED LEADS" }
  ];

  return (
    <div className="leads-page">
      <Sidebar />
      <div className="leads-content">
        <div className="leads-header">
          <h2 className="leads-title">Leads</h2>
          <button className="primary-button" onClick={handleNewLead}>New Lead</button>
        </div>
        
        {/* Enhanced Search Input */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input 
            type="text" 
            placeholder="Search leads by company name..." 
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              paddingRight: searchTerm ? "40px" : "12px"
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#666",
                padding: "2px 6px",
                borderRadius: "50%"
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div style={{
            marginBottom: "15px",
            padding: "8px 12px",
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d9ff",
            borderRadius: "4px",
            fontSize: "14px",
            color: "#0056b3"
          }}>
            {searchTerm.trim() ? `Searching for: "${searchTerm}"` : ""}
          </div>
        )}

        <div className="filter-buttons">
          {filterButtons.map((button) => (
            <button 
              key={button.value}
              className={`filter-button ${selectedFilter === button.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>
        
        {/* Pass both search term and filter to LeadsTable */}
        <LeadsTable 
          searchTerm={searchTerm} 
          statusFilter={selectedFilter}
        />
      </div>
    </div>
  );
}