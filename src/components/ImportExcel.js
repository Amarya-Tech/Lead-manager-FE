import React, { useRef, useState } from 'react';
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
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminSidebar from './AdminSideBar';
import { useAuthStore } from '../apicaller/AuthStore.js';

const CsvUploadPage = () => {
  const { userId } = useAuthStore();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [errorData, setErrorData] = useState([]);
  const [step, setStep] = useState(1);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && (uploadedFile.name.endsWith('.csv') || uploadedFile.name.endsWith('.xlsx'))) {
      setFile(uploadedFile);
    } else {
      setFile(null);
      toast.error('Please upload a valid Excel/CSV file.');
    }
  };

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

        console.log("response from upload excel", response);

        if (!response.data.success && response.status === 201) {
          setErrorData(response.data.data);
        } else if (response.data.success && response.status === 200){
          toast.success("File uploaded and processed successfully.");
          setErrorData([]);
        } else {
          toast.error("File did not processed correctly.")
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast.error('Something went wrong.');
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

  return (
    <Box >
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 6,
          px: 4,
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
              {step === 1 ? "Step 1: Upload Company Details Excel/CSV" : "Step 2: Upload Company Comments Excel/CSV" }
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
            <Typography variant="subtitle1" fontWeight={600} mb={1} fontSize={14}>
              Drag and drop an Excel/CSV file here
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2} fontSize={14}>
              Or, click to select a file from your computer
            </Typography>

            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 400, fontSize: 12 }}
            >
              Select File
              <Input
                type="file"
                inputProps={{ accept: '.csv, .xlsx' }}
                onChange={handleFileChange}
                inputRef={fileInputRef} // 
                sx={{ display: 'none' }}
              />
            </Button>

            {file && (
              <Typography variant="body2" mt={2} fontWeight={500} fontSize={12}>
                Selected: {file.name}
              </Typography>
            )}
          </Box>

          {file && (
            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyse}
                sx={{ px: 5, py: 1.2, borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}
              >
                Analyse and Upload Excel/CSV
              </Button>
            </Box>
          )}
           {/* Step Switch Buttons */}

          <Box mt={4} display="flex" justifyContent="center" gap={2} >
            <Button
              variant={step === 1 ? "contained" : "outlined"}
              onClick={() => setStep(1)}
              sx={{fontSize:'12px'}}
            >
              Step 1: Upload Company Details
            </Button>

            <Button
              variant={step === 2 ? "contained" : "outlined"}
              onClick={() => setStep(2)}
              sx={{fontSize:'12px'}}
            >
              Step 2: Upload Company Comments
            </Button>
          </Box>
        </Paper>

        {/* Table for Error Data */}
        {errorData.length > 0 && (
          <Box mt={6} mx="auto">
            <Typography variant="h6" gutterBottom textAlign="center" sx={{
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`, color: "#c30010"
            }}>
              Validation Errors
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'unset'}}>
              <Table>
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((key) => (
                      <TableCell key={key}  sx={{
                          fontWeight: 'bold',
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          width: `${100 / tableHeaders.length}%`
                        }}>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}  sx={{ backgroundColor: row.validation_error ? '#fff6f6' : 'inherit' }}>
                      {tableHeaders.map((key, colIndex) => (
                        <TableCell key={colIndex} sx={{
                            whiteSpace: 'normal',
                            wordWrap: 'break-word'
                          }}>{row[key] || ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CsvUploadPage;
