import React, { useEffect, useRef, useState } from 'react';
import apiClient from "../apicaller/APIClient.js";
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Paper,
  Input,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthStore } from '../apicaller/AuthStore.js';
import Sidebar from './SideBar.js';
import DownloadIcon from '@mui/icons-material/Download';

const ExportExcel = () => {
  const { userId , role} = useAuthStore();
  const userRole = role;
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [errorData, setErrorData] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [userCompanies, setUserCompanies] = useState([]);


  const downloadLeadsInCsv = async () => {
      try{
        let response, companyId = null;
        const company_name = userCompanies.filter((company) => company.id == selectedCompany);
        const downloadBySelectedCompany = company_name.length == 0 ? "All Brands" : company_name[0].parent_company_name;
        response = await apiClient.get(`/lead/export-leads/${userId}?parent_company_name=${downloadBySelectedCompany}` , {
          responseType : 'blob'
        });
        const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadBySelectedCompany ? `${downloadBySelectedCompany}-leads.csv` : `all-leads.csv`;
  
      document.body.appendChild(link);
      link.click();
  
      link.remove();
      window.URL.revokeObjectURL(url);
      }catch(error){
        console.error("Failed to fetch leads:", error);
      }
    }

  const handleAnalyse = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl =
        step === 1
          ? `/lead/insert-lead-data-from-excel/${userId}`
          : `/lead/insert-lead-comment-data-from-excel/${userId}`;

      const response = await apiClient.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (!response.data.success && response.status === 201) {
        setErrorData(response.data.data);
      } else if (response.data.success && response.status === 200) {
        toast.success("File uploaded and processed successfully.");
        setErrorData([]);
      } else {
        toast.error("File did not processed correctly.")
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      const backendMessage = error.response?.data?.message || 'Something went wrong.';
      toast.error(backendMessage);
    }

  };

  const getHeaders = (data) => {
    if (!data || data.length === 0) return [];
    const keys = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'validation_error') {
          keys.add(key);
        }
      });
    });
    return [...keys, 'validation_error'];
  };

  const handleReset = () => {
    setFile(null);
    setErrorData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tableHeaders = getHeaders(errorData);

    useEffect(() => {
      const fetchUserCompanies = async () => {
        try {
          const response = await apiClient.get(`/lead/fetch-company-brands`);
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setUserCompanies(response.data.data);
          } else {
            setUserCompanies([]);
          }
        } catch (error) {
          console.error("Error fetching company brands:", error);
          setUserCompanies([]);
        }
      };
  
      fetchUserCompanies();
    }, []);
  

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 6,
          px: 8,
          minHeight: '90vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 700,
            mx: 'auto',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton onClick={handleReset}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} ml={1}>
              {step === 1 ? "Step 1: Download Leads Details In Excel/CSV" : "Step 2: Upload Company Comments Excel/CSV"}
            </Typography>
          </Box>

          <Box
            sx={{
              border: '2px dashed #CBD5E0',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
          >
            <Box position="relative" width="100%" display="flex" justifyContent="space-between" alignItems="center">       
                <Box position="relative" mb={1} width="250px">
                    <Typography variant="h6" sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
                    }}>Filter by Managing Brand
                    </Typography>
        
                    <TextField
                    select
                    fullWidth
                    variant="outlined"
                    Placeholder="Filter by Managing Brand"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{
                        '& .MuiInputBase-root': {
                        fontSize: '12px',   // font for selected value
                        height: '40px',
                        },
                        '& .MuiInputLabel-root': {
                        fontSize: '10px',   // font for label
                        },
                        '& option': {
                        fontSize: '10px',   // font for dropdown items
                        },
                    }}
                    >
        
                    <option value="">All Brands</option>
                    {userCompanies.map((company) => (
                        <option key={company.id} value={company.id} onClick={() => setDownloadBySelectedCompany(company.parent_company_name)}>
                        {company.parent_company_name}
                        </option>
                    ))}
                    </TextField>
                </Box>
                { userRole === "super_admin" && 
                    <Box mt={4} display="flex" justifyContent="center" gap={2} >
                        <Button
                            variant={step === 1 ? "contained" : "outlined"}
                            sx={{ fontSize: '12px' }}
                            onClick={() => downloadLeadsInCsv()}
                        >
                            Download Lead Details
                        </Button>
                    </Box>
                }
            </Box>
          </Box>
        </Paper>

        {/* Table for Error Data */}
        {errorData.length > 0 && (
          <Box
            mt={6}
            mx="auto"
            sx={{
              width: "75vw",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              textAlign="center"
              sx={{
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
                color: "#c30010",
              }}
            >
              Validation Errors
            </Typography>

            <Paper
              elevation={3}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "60vh", 
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                            backgroundColor: "#f1f5f9",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {key.replace(/_/g, " ").toUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {errorData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          backgroundColor: row.validation_error ? "#fff6f6" : "inherit",
                        }}
                      >
                        {tableHeaders.map((key, colIndex) => (
                          <TableCell
                            key={colIndex}
                            sx={{
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {row[key] || ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>
        )}


      </Box>
    </Box>
  );
};

export default ExportExcel;
