import { useState, useEffect, useMemo } from "react";
import Cookies from 'js-cookie';
import apiClient from "../apicaller/APIClient.js";
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
  Pagination,
  CircularProgress
} from "@mui/material";

export default function LeadsLogTable({ searchTerm = "", statusFilter = "", onUpdateLead, onViewLogs }) {
  const userId = Cookies.get("user_id");
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 18;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        let response;

          if (searchTerm.trim()) {
          response = await apiClient.get(`/lead/search-term/${userId}`, {
            params: { term: searchTerm.trim() }
          });
        } else {
          response = await apiClient.get(`/lead/fetch-lead-log-list/${userId}`);
        }

        if (Array.isArray(response.data.data)) {
          let result = response.data.data;

          if (statusFilter.trim()) {
            result = result.filter((lead) =>
              lead.status?.toLowerCase() === statusFilter.trim().toLowerCase()
            );
          }

          setLeads(result);
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
    setCurrentPage(1);
  }, [searchTerm, statusFilter, userId]);

  const handleUpdateLead = (leadId) => {
    if (onUpdateLead) onUpdateLead(leadId);
  };

  const handleViewLogs = (leadId) => {
    if (onViewLogs) onViewLogs(leadId);
  };

  const totalPages = Math.ceil(leads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = useMemo(() => leads.slice(startIndex, endIndex), [leads, startIndex, endIndex]);

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && goToPage(currentPage + 1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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
        <Box component="mark" key={index} sx={{ backgroundColor: '#ffeb3b', px: 0.5 }}>{part}</Box>
      ) : part
    );
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'lead': return { backgroundColor: '#ffe0b2', color: '#8a4b00', px: 1, py: 0.5, borderRadius: 1 };
      case 'prospect': return { backgroundColor: '#bbdefb', color: '#0d47a1', px: 1, py: 0.5, borderRadius: 1 };
      case 'active prospect': return { backgroundColor: '#c8e6c9', color: '#1b5e20', px: 1, py: 0.5, borderRadius: 1 };
      case 'customer': return { backgroundColor: '#ffcdd2', color: '#b71c1c', px: 1, py: 0.5, borderRadius: 1 };
      default: return { backgroundColor: '#e0e0e0', color: '#424242', px: 1, py: 0.5, borderRadius: 1 };
    }
  };

  return (
    <Box>
      {currentLeads.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid #ddd' }}>
          <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }} aria-label="leads table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f4f4f4', height: 20 }}>
                <TableCell><strong>Company Name</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Industry Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Latest Comment</strong></TableCell>
                <TableCell><strong>Latest Comment Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody >
              {currentLeads.map((lead, index) => (
                <TableRow key={lead.id || index} sx={{
                  '& td': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    lineHeight: '1.2',
                  },
                  height: '32px',
                }}>
                  <TableCell>{highlightSearchTerm(lead.company_name, searchTerm)}</TableCell>
                  <TableCell>{lead.product}</TableCell>
                  <TableCell>{highlightSearchTerm(lead.industry_type, searchTerm)}</TableCell>
                  <TableCell>
                    <Box component="span" sx={getStatusStyle(lead.status)}>{lead.status}</Box>
                  </TableCell>
                  <TableCell>{lead.latest_comment}</TableCell>
                  <TableCell>{lead.latest_comment_date}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="success" size="small" sx={{ mr: 1 }} onClick={(e) => handleUpdateLead(lead.id, e)}>
                      Update Lead
                    </Button>
                    <Button variant="outlined" color="info" size="small" onClick={() => handleViewLogs(lead.id)}>
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography align="center" sx={{ mt: 3 }}>No leads found.</Typography>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1} mt={3}>
          <Button onClick={goToPreviousPage} disabled={currentPage === 1} variant="outlined">Previous</Button>
          {getPageNumbers().map((page, index) => (
            <Box key={index}>
              {page === '...' ? (
                <Typography sx={{ px: 1 }}>...</Typography>
              ) : (
                <Button
                  variant={currentPage === page ? 'contained' : 'outlined'}
                  onClick={() => goToPage(page)}
                  sx={{ fontWeight: currentPage === page ? 'bold' : 'normal' }}
                >
                  {page}
                </Button>
              )}
            </Box>
          ))}
          <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outlined">Next</Button>
          <Typography sx={{ ml: 2, fontSize: 14, color: 'text.secondary' }}>
            Page {currentPage} of {totalPages} ({leads.length} total leads)
          </Typography>
        </Box>
      )}
    </Box>
  );
}
