import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import Sidebar from "../components/SideBar.js";
import LeadsManager from "../components/LeadManager.js";
import { Box, Typography, TextField, IconButton, Paper, InputAdornment } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import apiClient from "../apicaller/APIClient.js";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const { status } = useParams();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

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
      <Box display="flex">
        <Sidebar />
        <Box component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              ml: '6px',  
              width: 'calc(100% - 180px)',      
            }}>
          <Box justifyContent="space-between" alignItems="center" sx={{mb:'20px', mt:'10px'}}>
            <Typography variant="h5" sx={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
            }}>
              Leads
            </Typography>

               {/*Filter by Company/Brand  */}
              <Box position="relative" mb={1} mt={3} width="250px">
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
                      fontSize: '12px',   // font for label
                    },
                    '& option': {
                      fontSize: '12px',   // font for dropdown items
                    },
                  }}
                >
                
                  <option value="">All Brands</option>
                  {userCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.parent_company_name}
                    </option>
                  ))}
                </TextField>
              </Box>

            {/* Search Box */}
            <Box position="relative" mb={1} mt={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search leads by company name, industry type and product..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              InputProps={{
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} title="Clear search">
                      <ClearIcon sx={{ color: '#666'}} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& input': {
                  paddingRight: searchTerm ? '40px' : '10px',
                  paddingLeft: '10px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '12px',
                }

              }}
            />
          </Box>

            {searchTerm && (
              <Paper
                elevation={0}
                sx={{
                  mb: 1,
                  px: 2,
                  py: 1,
                  backgroundColor: "#e7f3ff",
                  border: "1px solid #b3d9ff",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "#0056b3"
                }}
              >
                {searchTerm.trim() ? `Searching for: "${searchTerm}"` : ""}
              </Paper>
            )}

            <LeadsManager searchTerm={searchTerm} statusFilter={status} selectedCompany={selectedCompany}/>
          </Box>
        </Box>
      </Box>
  );
}
