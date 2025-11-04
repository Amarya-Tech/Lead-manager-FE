import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Divider,
} from "@mui/material";
import React from 'react';
import { useState, useEffect, useMemo } from "react";
import apiClient from "../apicaller/APIClient.js";
import './css/LeadsTable.css'
import { useAuthStore } from "../apicaller/AuthStore.js";
import Sidebar from "./SideBar.js";

export default function UnAssignedLeads() {
    const [leads, setLeads] = useState([]);
    const { userId } = useAuthStore();
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 10;

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                let response;
                const action = "";
                response = await apiClient.post(`/lead/fetch-assigned-unassigned-leads/${userId}`, {
                    action: 'unassigned'
                });

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
    }, [userId]);

    const totalPages = Math.ceil(leads.length / leadsPerPage);
    const startIndex = (currentPage - 1) * leadsPerPage;
    const currentLeads = useMemo(() => leads.slice(startIndex, startIndex + leadsPerPage), [leads, startIndex]);
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'lead':
                return '#e0e0e0';
            case 'prospect':
                return '#bbdefb';
            case 'active prospect':
                return '#ffe0b2';
            case 'customer':
                return '#c8e6c9';
            default:
                return '#f5f5f5';
        }
    };

    return (
        <Box display="flex" sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
        }}>
            <Sidebar />
            <Box component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: '6px',
                    width: 'calc(100% - 180px)',
                }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: '20px', mt: '10px' }}>
                    <Typography variant="h5" sx={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: '#1038afff',
                        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
                    }}>Unassigned Leads
                    </Typography>
                </Box>
                {currentLeads.length === 0 && (
                    <Box textAlign="center" mt={2}>
                        <Typography variant="h6">No leads found</Typography>
                    </Box>
                )}
                {currentLeads.length > 0 && (
                    <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid #ddd' }}>
                        <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }} aria-label="leads table">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f4f4f4', height: 18 }}>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Company Name</strong></TableCell>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Product</strong></TableCell>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Industry Type</strong></TableCell>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Status</strong></TableCell>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Assignee</strong></TableCell>
                                    <TableCell sx={{ fontSize: '12px', paddingTop: '8px', paddingBottom: '8px' }}><strong>Created Date</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentLeads.map((lead, index) => (
                                    <TableRow key={lead.id || index} sx={{
                                        '& td': {
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                        },
                                    }}>
                                        <TableCell sx={{ fontSize: '12px' }}>{lead.company_name}</TableCell>
                                        <TableCell sx={{ fontSize: '12px' }}>{lead.product}</TableCell>
                                        <TableCell sx={{ fontSize: '12px' }}>{lead.industry_type}</TableCell>
                                        <TableCell><Box
                                            component="span"
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '12px',
                                                color: '#333',
                                                fontWeight: 500,
                                                fontSize: '12px',
                                                backgroundColor: getStatusColor(lead.status)
                                            }}
                                        >
                                            {lead.status}
                                        </Box></TableCell>
                                        <TableCell sx={{ fontSize: '12px' }}>{lead.assigned_person}</TableCell>
                                        <TableCell sx={{ fontSize: '12px' }}>{lead.created_date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {totalPages > 1 && (
                    <Box className="pagination">
                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ fontSize: '12px' }}>
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                if (page <= 2 || page === totalPages) return true;
                                if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                                return false;
                            })
                            .map((page, index, filteredPages) => {
                                const prevPage = filteredPages[index - 1];
                                const showEllipsis = prevPage && page - prevPage > 1;

                                return (
                                    <React.Fragment key={page}>
                                        {showEllipsis && <span style={{ fontSize: '12px' }}>...</span>}
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{ fontSize: '12px' }}
                                            className={currentPage === page ? "active" : ""}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ fontSize: '12px' }}>
                            Next
                        </button>
                        <span style={{ fontSize: '12px' }} className="page-info">Page {currentPage} of {totalPages}</span>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
