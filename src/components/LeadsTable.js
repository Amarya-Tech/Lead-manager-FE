import "./css/LeadsTable.css";
import { useState, useEffect, useMemo } from "react";
import apiClient from "../apicaller/APIClient.js";
import Cookies from 'js-cookie'; 

export default function LeadsTable({ searchTerm = "", statusFilter = "ALL LEADS" }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const userId = Cookies.get("user_id")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await apiClient.get(`/lead/fetch-lead-table-detail/${userId}`);
        if (Array.isArray(response.data.data)) {
          setLeads(response.data.data);
        } else {
          console.error("Invalid data format:", response.data);
          setLeads([]);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        setLeads([]);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (statusFilter !== "ALL LEADS") {
      switch (statusFilter) {
        case "OPEN LEADS":
          filtered = filtered.filter(lead => lead.status === "new");
          break;
        case "CONTACTED LEADS":
          filtered = filtered.filter(lead => lead.status === "contacted");
          break;
        case "CLOSED LEADS":
          filtered = filtered.filter(lead => lead.status === "closed");
          break;
        default:
          break;
      }
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(lead => 
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    return filtered;
  }, [leads, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedLeadDetails(null); 
  }, [searchTerm, statusFilter]);


  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
 
  const currentLeads = useMemo(() => {
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, startIndex, endIndex]);

  const handleViewDetails = async (leadId) => {
    try {
      setLoadingDetails(true);
      setSelectedLeadDetails(null);

      const response = await apiClient.get(`/lead/get-lead-detail/${leadId}`);
      // console.log("Full response:", response.data);
      // console.log("Response data:", response.data.data);
      
      const leadData = Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
      
      // console.log("Lead data to set:", leadData);
      setSelectedLeadDetails(leadData || null);
    } catch (error) {
      console.error("Failed to fetch lead details", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    setSelectedLeadDetails(null);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        if (totalPages > 4) pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Highlight search term in company name
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '1px 2px' }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <>
      {/* Leads Table */}
      <div style={{ marginBottom: "20px" }}>
        {(searchTerm || statusFilter !== "ALL LEADS") && filteredLeads.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>No leads found</h3>
            <p style={{ color: "#6c757d", margin: 0 }}>
              {searchTerm && statusFilter !== "ALL LEADS" 
                ? `No companies match "${searchTerm}" in ${statusFilter.toLowerCase()}.`
                : searchTerm 
                ? `No companies match "${searchTerm}". Try adjusting your search term.`
                : `No leads found for ${statusFilter.toLowerCase()}.`
              }
            </p>
          </div>
        )}

        {/* Results Summary */}
        {(searchTerm || statusFilter !== "ALL LEADS") && filteredLeads.length > 0 && (
          <div style={{
            marginBottom: "15px",
            padding: "8px 12px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            fontSize: "14px",
            color: "#155724"
          }}>
            Found {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} 
            {searchTerm && statusFilter !== "ALL LEADS" 
              ? ` matching "${searchTerm}" in ${statusFilter.toLowerCase()}`
              : searchTerm 
              ? ` matching "${searchTerm}"`
              : ` in ${statusFilter.toLowerCase()}`
            }
          </div>
        )}

        {currentLeads.length > 0 && (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Product</th>
                <th>Industry Type</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map((lead, index) => (
                <tr key={lead.id || index}>
                  <td>{highlightSearchTerm(lead.company_name, searchTerm)}</td>
                  <td>{lead.product}</td>
                  <td>{lead.industry_type}</td>
                  <td>{lead.status}</td>
                  <td>{lead.created_date}</td>
                  <td>
                    <button onClick={() => handleViewDetails(lead.id)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: "10px", 
            marginTop: "20px",
            padding: "10px"
          }}>
            {/* Previous Button */}
            <button 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                backgroundColor: currentPage === 1 ? "#f5f5f5" : "#fff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                borderRadius: "4px"
              }}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <span key={index}>
                {page === '...' ? (
                  <span style={{ padding: "8px 4px", color: "#666" }}>...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      backgroundColor: currentPage === page ? "#007bff" : "#fff",
                      color: currentPage === page ? "#fff" : "#000",
                      cursor: "pointer",
                      borderRadius: "4px",
                      fontWeight: currentPage === page ? "bold" : "normal"
                    }}
                  >
                    {page}
                  </button>
                )}
              </span>
            ))}

            {/* Next Button */}
            <button 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                backgroundColor: currentPage === totalPages ? "#f5f5f5" : "#fff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                borderRadius: "4px"
              }}
            >
              Next
            </button>

            {/* Page Info */}
            <span style={{ marginLeft: "15px", color: "#666", fontSize: "14px" }}>
              Page {currentPage} of {totalPages} 
              ({filteredLeads.length} {(searchTerm || statusFilter !== "ALL LEADS") ? 'filtered' : 'total'} leads)
            </span>
          </div>
        )}
      </div>

      {/* Lead Details Section */}
      {loadingDetails && <p>Loading lead details...</p>}

      {selectedLeadDetails && (
        <div className="lead-details" style={{ 
          marginTop: "20px", 
          padding: "15px", 
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#f9f9f9"
        }}>
          <h2>Lead Details</h2>
          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            {/* Left: Lead Basic Info */}
            <div style={{ flex: 1 }}>
              <p><strong>Company Name:</strong> {selectedLeadDetails.company_name}</p>
              <p><strong>Product:</strong> {selectedLeadDetails.product}</p>
              <p><strong>Industry Type:</strong> {selectedLeadDetails.industry_type}</p>
              <p><strong>Insured Amount:</strong> {selectedLeadDetails.insured_amount || "N/A"}</p>
              <p><strong>Export Value:</strong> {selectedLeadDetails.export_value || "N/A"}</p>
              <p><strong>Status:</strong> {selectedLeadDetails.status}</p>
              <p><strong>Created Date:</strong> {selectedLeadDetails.created_date}</p>
            </div>

            {/* Right: Lead Contact Details */}
            <div style={{ flex: 1 }}>
              <h3>Contact Details</h3>
              {Array.isArray(selectedLeadDetails.contact_details) && selectedLeadDetails.contact_details.length > 0 ? (
                selectedLeadDetails.contact_details.map((contact, idx) => (
                  <div key={contact.contact_id || idx} style={{ marginBottom: "10px" }}>
                    <p><strong>Name:</strong> {contact.name}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Phone:</strong> {contact.phone}</p>
                    <p><strong>Alt Phone:</strong> {contact.alt_phone}</p>
                    <hr />
                  </div>
                ))
              ) : (
                <p>No contact details available.</p>
              )}
            </div>
          </div>

          {/* Office Details Section */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Office Details</h3>
            {Array.isArray(selectedLeadDetails.office_details) && selectedLeadDetails.office_details.length > 0 ? (
              selectedLeadDetails.office_details.map((office, idx) => (
                <div key={office.office_id || idx} style={{ marginBottom: "10px" }}>
                  <p><strong>Address:</strong> {office.address}</p>
                  <p><strong>City:</strong> {office.city}</p>
                  <p><strong>Country:</strong> {office.country}</p>
                  <hr />
                </div>
              ))
            ) : (
              <p>No office details available.</p>
            )}
          </div>

          <button 
            onClick={() => setSelectedLeadDetails(null)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Close Details
          </button>
        </div>
      )}
    </>
  );
}