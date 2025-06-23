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
import { useState, useEffect, useMemo } from "react";
import apiClient from "../apicaller/APIClient.js";
import Cookies from 'js-cookie';
import './css/LeadsTable.css'

export default function LeadsTable({ searchTerm = "" }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const userId = Cookies.get("user_id");

  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        let response;

        if (searchTerm.trim()) {
          response = await apiClient.get(`/lead/search`, {
            params: { term: searchTerm.trim() }
          });
        } else {
          response = await apiClient.get(`/lead/fetch-lead-table-detail/${userId}`);
        }

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
    setCurrentPage(1);
    setSelectedLeadDetails(null);
  }, [searchTerm, userId]);

  const totalPages = Math.ceil(leads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = useMemo(() => leads.slice(startIndex, startIndex + leadsPerPage), [leads, startIndex]);

  const handleViewDetails = async (leadId) => {
    setLoadingDetails(true);
    setSelectedLeadDetails(null);
    try {
      const response = await apiClient.get(`/lead/get-lead-detail/${leadId}`);
      const leadData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      setSelectedLeadDetails(leadData || null);
    } catch (error) {
      console.error("Failed to fetch lead details", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const highlightSearchTerm = (text, term) => {
    if (!term.trim() || !text) return text;
    const regex = new RegExp(`(${term.trim()})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '1px 2px' }}>{part}</mark> : part
    );
  };

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
    <Box>
      {searchTerm && leads.length === 0 && (
        <Box textAlign="center" mt={2}>
          <Typography variant="h6">No leads found</Typography>
          <Typography variant="body2">No companies match "{searchTerm}". Try adjusting your search.</Typography>
        </Box>
      )}

      {searchTerm && leads.length > 0 && (
        <Box textAlign="center" mb={2}>
          <Typography variant="subtitle1">
            Found {leads.length} lead{leads.length !== 1 ? "s" : ""} matching "{searchTerm}"
          </Typography>
        </Box>
      )}

      {currentLeads.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid #ddd' }}>
          <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }} aria-label="leads table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f4f4f4', height: 20 }}>
                <TableCell><strong>Company Name</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Industry Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created Date</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
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
                  <TableCell><Box
                    component="span"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      backgroundColor: getStatusColor(lead.status)
                    }}
                  >
                    {lead.status}
                  </Box></TableCell>
                  <TableCell>{lead.created_date}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewDetails(lead.id)} variant="contained" sx={{ fontSize: '13px', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' }, textTransform: 'none'  }}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "active" : ""}
              >
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
        </Box>
      )}

      {loadingDetails && <Typography>Loading lead details...</Typography>}

      {selectedLeadDetails && (
        <Box className="lead-details" sx={{ mt: 4 }}>
          <Typography variant="h5">Lead Details</Typography>
          <Divider sx={{ my: 2 }} />
          <Box className="lead-info-grid" sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography><strong>Company Name:</strong> {selectedLeadDetails.company_name}</Typography>
              <Typography><strong>Product:</strong> {selectedLeadDetails.product}</Typography>
              <Typography><strong>Industry Type:</strong> {selectedLeadDetails.industry_type}</Typography>
              <Typography><strong>Insured Amount:</strong> {selectedLeadDetails.insured_amount || "N/A"}</Typography>
              <Typography><strong>Export Value:</strong> {selectedLeadDetails.export_value || "N/A"}</Typography>
              <Typography><strong>Suitable Product:</strong> {selectedLeadDetails.suitable_product || "N/A"}</Typography>
              <Typography><strong>Status:</strong> {selectedLeadDetails.status}</Typography>
              <Typography><strong>Created Date:</strong> {selectedLeadDetails.created_date}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Contact Details</Typography>
              {Array.isArray(selectedLeadDetails.contact_details) && selectedLeadDetails.contact_details.length > 0 ? (
                selectedLeadDetails.contact_details.map((c, i) => (
                  <Box key={c.contact_id || i}>
                    <Typography><strong>Name:</strong> {c.name}</Typography>
                    <Typography><strong>Email:</strong> {c.email}</Typography>
                    <Typography><strong>Phone:</strong> {c.phone}</Typography>
                    <Typography><strong>Alt Phone:</strong> {c.alt_phone}</Typography>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))
              ) : (
                <Typography>No contact details available.</Typography>
              )}
            </Box>
          </Box>
          <Box mt={3}>
            <Typography variant="h6">Office Details</Typography>
            {Array.isArray(selectedLeadDetails.office_details) && selectedLeadDetails.office_details.length > 0 ? (
              selectedLeadDetails.office_details.map((o, i) => (
                <Box key={o.office_id || i}>
                  <Typography><strong>Address:</strong> {o.address}</Typography>
                  <Typography><strong>City:</strong> {o.city}</Typography>
                  <Typography><strong>Country:</strong> {o.country}</Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))
            ) : (
              <Typography>No office details available.</Typography>
            )}
          </Box>
          <Button onClick={() => setSelectedLeadDetails(null)} color="error" sx={{ mt: 2, color: '#ffffff', backgroundColor: 'red', '&:hover': { backgroundColor: '#A2120B' }, textTransform: 'none'  }}>
            Close Details
          </Button>
        </Box>
      )}
    </Box>
  );
}
