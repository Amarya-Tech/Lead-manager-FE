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
import './css/LeadsTable.css'
import { useAuthStore } from "../apicaller/AuthStore.js";

export default function LeadsTable({ searchTerm = "" }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { userId } = useAuthStore();

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
        </Box>
      )}

      {currentLeads.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid #ddd' }}>
          <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }} aria-label="leads table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f4f4f4',height: 18}}>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Company Name</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Product</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Industry Type</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Status</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Assignee</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Created Date</strong></TableCell>
                <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Action</strong></TableCell>
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
                  <TableCell sx={{ fontSize:'12px'}}>{highlightSearchTerm(lead.company_name, searchTerm)}</TableCell>
                  <TableCell sx={{ fontSize:'12px'}}>{highlightSearchTerm(lead.product, searchTerm)}</TableCell>
                  <TableCell sx={{ fontSize:'12px'}}>{highlightSearchTerm(lead.industry_type, searchTerm)}</TableCell>
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
                  <TableCell sx={{ fontSize:'12px'}}>{lead.assigned_person}</TableCell>
                  <TableCell sx={{ fontSize:'12px'}}>{lead.created_date}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewDetails(lead.id)} variant="contained" sx={{ fontSize: '10px', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' }, textTransform: 'none'  }}>View Details</Button>
                  </TableCell>
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
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{ fontSize: '12px' }}
                className={currentPage === page ? "active" : ""}
              >
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ fontSize: '12px' }}>
            Next
          </button>
          <span style={{ fontSize: '12px' }} className="page-info">Page {currentPage} of {totalPages}</span>
        </Box>
      )}

      {loadingDetails && <Typography>Loading lead details...</Typography>}

      {selectedLeadDetails && (
        <Box className="lead-details" sx={{ mt: 2 }}>
          <Typography variant="h5" sx={{fontSize:'16px', fontWeight:'bold'}}>Lead Details</Typography>
          <Divider sx={{ my: 1 }} />
          <Box className="lead-info-grid" sx={{ display: 'flex', gap: 4, flexWrap: 'wrap'}}>
            <Box>
              <Typography sx={{fontSize:'12px'}}><strong>Company Name:</strong> {selectedLeadDetails.company_name}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Product:</strong> {selectedLeadDetails.product}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Industry Type:</strong> {selectedLeadDetails.industry_type}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Insured Amount:</strong> {selectedLeadDetails.insured_amount || "N/A"}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Export Value:</strong> {selectedLeadDetails.export_value || "N/A"}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Suitable Product:</strong> {selectedLeadDetails.suitable_product || "N/A"}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Status:</strong> {selectedLeadDetails.status}</Typography>
              <Typography sx={{fontSize:'12px'}}><strong>Created Date:</strong> {selectedLeadDetails.created_date}</Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{fontSize:'16px', fontWeight:'bold'}}>Contact Details</Typography>
              {Array.isArray(selectedLeadDetails.contact_details) && selectedLeadDetails.contact_details.length > 0 ? (
                selectedLeadDetails.contact_details.map((c, i) => (
                  <Box key={c.contact_id || i}>
                    <Typography sx={{fontSize:'12px'}}><strong>Name:</strong> {c.name}</Typography>
                    <Typography sx={{fontSize:'12px'}}><strong>Email:</strong> {c.email}</Typography>
                    <Typography sx={{fontSize:'12px'}}><strong>Phone:</strong> {c.phone}</Typography>
                    <Typography sx={{fontSize:'12px'}}><strong>Alt Phone:</strong> {c.alt_phone}</Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{fontSize:'12px'}}>No contact details available.</Typography>
              )}
            </Box>
            <Box >
              <Typography variant="h6" sx={{fontSize:'16px', fontWeight:'bold'}}>Office Details</Typography>
              {Array.isArray(selectedLeadDetails.office_details) && selectedLeadDetails.office_details.length > 0 ? (
                selectedLeadDetails.office_details.map((o, i) => (
                  <Box key={o.office_id || i}>
                    <Typography sx={{fontSize:'12px'}}><strong>Address:</strong> {o.address}</Typography>
                    <Typography sx={{fontSize:'12px'}}><strong>City:</strong> {o.city}</Typography>
                    <Typography sx={{fontSize:'12px'}}><strong>Country:</strong> {o.country}</Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{fontSize:'12px'}}>No office details available.</Typography>
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Button onClick={() => setSelectedLeadDetails(null)} color="error" sx={{pl:'10px',pr:'10px',mt:0.5 ,color: '#ffffff', backgroundColor: 'red', '&:hover': { backgroundColor: '#A2120B' }, textTransform: 'none', fontSize:'10px'}}>
            Close Details
          </Button>
        </Box>
      )}
    </Box>
  );
}
