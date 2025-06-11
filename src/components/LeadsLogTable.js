
import "./css/LeadsTable.css";
import Cookies from 'js-cookie';
import { useState, useEffect, useMemo } from "react";
import apiClient from "../apicaller/APIClient.js";

export default function LeadsLogTable({ searchTerm = "", onUpdateLead, onViewLogs  }) {

    const userId = Cookies.get("user_id");
    const [leads, setLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 25;

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await apiClient.get(`/lead/fetch-lead-log-list/${userId}`);
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

    const handleUpdateLead = (leadId) => {
        if (onUpdateLead) {
            onUpdateLead(leadId);
        }
    };

    const handleViewLogs = (leadId) => {
        if (onViewLogs) {
            onViewLogs(leadId);
        }
    };

    const filteredLeads = useMemo(() => {
        if (!searchTerm.trim()) {
            return leads;
        }

        return leads.filter((lead) =>
            lead.company_name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
    }, [leads, searchTerm]);

    const totalPages = Math.ceil(leads.length / leadsPerPage);
    const startIndex = (currentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;

    const currentLeads = useMemo(() => {
        return filteredLeads.slice(startIndex, endIndex);
    }, [filteredLeads, startIndex, endIndex]);

    const goToPage = (page) => {
        setCurrentPage(page);
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

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'new':
                return { backgroundColor: '#ffe0b2', color: '#8a4b00', padding: '4px 8px', borderRadius: '4px' };
            case 'no pickup':
                return { backgroundColor: '#bbdefb', color: '#0d47a1', padding: '4px 8px', borderRadius: '4px' };
            case 'contacted':
                return { backgroundColor: '#c8e6c9', color: '#1b5e20', padding: '4px 8px', borderRadius: '4px' };
            case 'closed':
                return { backgroundColor: '#ffcdd2', color: '#b71c1c', padding: '4px 8px', borderRadius: '4px' };
            default:
                return { backgroundColor: '#e0e0e0', color: '#424242', padding: '4px 8px', borderRadius: '4px' };
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>
            {/* LEAD TABLE */}
            {currentLeads.length > 0 ? (
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Product</th>
                            <th>Industry Type</th>
                            <th>Status</th>
                            <th>Latest Comment</th>
                            <th>Latest Comment Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLeads.map((lead, index) => (
                            <tr key={lead.id || index}>
                                <td>{highlightSearchTerm(lead.company_name, searchTerm)}</td>
                                <td>{lead.product}</td>
                                <td>{lead.industry_type}</td>
                                <td>
                                    <span style={getStatusStyle(lead.status)}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td>{lead.latest_comment}</td>
                                <td>{lead.latest_comment_date}</td>
                                <td>
                                    <button
                                        style={{
                                            marginRight: '8px',
                                            padding: '5px 10px',
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleUpdateLead(lead.lead_id)}
                                    >
                                        Update Lead
                                    </button>

                                    <button
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#17a2b8',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleViewLogs(lead.lead_id)}
                                    >
                                        View Logs
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: "center", marginTop: "20px" }}>No leads found.</p>
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

                    <span style={{ marginLeft: "15px", color: "#666", fontSize: "14px" }}>
                        Page {currentPage} of {totalPages} ({leads.length} total leads)
                    </span>
                </div>
            )}
        </div>
    );
}