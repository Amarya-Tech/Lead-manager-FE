import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import Sidebar from "../components/SideBar.js";
import LeadsManager from "../components/LeadManager.js";
import { Box, Typography, TextField, IconButton, Paper, InputAdornment, Drawer, Button  } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import Chip from '@mui/material/Chip';
import TuneIcon from '@mui/icons-material/Tune'; 
import apiClient from "../apicaller/APIClient.js";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const { status } = useParams();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Advanced search fields
  const [filters, setFilters] = useState({
    companyName: "",
    product: "",
    industryType: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({
    companyName: "",
    product: "",
    industryType: ""
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

 const handleAdvancedChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleAdvancedSearch = () => {
    setAppliedFilters(filters);
    setAdvancedOpen(false);
    setFilters({
    companyName: "",
    product: "",
    industryType: ""
  });
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
                      fontSize: '12px',  
                      height: '40px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '12px',
                    },
                    '& option': {
                      fontSize: '12px',  
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

            {/* Search Box  For Advance Search*/}
            <Box position="relative" mb={1} mt={2} display="flex" alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search leads by company name, industry type and product..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              InputProps={{
                startAdornment: (
                  <>
                    {Object.entries(appliedFilters).map(([key, value]) =>
                      value ? (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          size="small"
                          onDelete={() => setAppliedFilters(prev => ({ ...prev, [key]: "" }))}
                          sx={{ mr: 0.5 }}
                        />
                      ) : null
                    )}
                  </>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchTerm && (
                      <IconButton onClick={clearSearch} title="Clear search">
                        <ClearIcon sx={{ color: '#666'}} />
                      </IconButton>
                    )}
                    <IconButton onClick={() => setAdvancedOpen(true)} title="Advanced Search">
                      <TuneIcon sx={{ color: '#303840ff'}} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& input': {
                  paddingRight: '80px',
                  paddingLeft: '10px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '12px',
                }

              }}
            />
          </Box>

           {/* Advanced Search Drawer */}
          <Drawer
            anchor="right"
            open={advancedOpen}
            onClose={() => setAdvancedOpen(false)}
          >
            <Box sx={{ width: 350, p: 3 }}>
              <Typography variant="h6" mb={1} sx={{fontSize: '17px', fontWeight: 'bold'}}>Advanced Search</Typography>
              <TextField
                name="companyName"
                label="Company Name"
                value={filters.companyName}
                onChange={handleAdvancedChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="product"
                label="Product"
                value={filters.product}
                onChange={handleAdvancedChange}
                fullWidth
                margin="normal"
              />
              <TextField
                name="industryType"
                label="Industry Type"
                value={filters.industryType}
                onChange={handleAdvancedChange}
                fullWidth
                margin="normal"
              />
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={() => setAdvancedOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleAdvancedSearch}>Search</Button>
              </Box>
            </Box>
          </Drawer>

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

            <LeadsManager searchTerm={searchTerm} statusFilter={status} selectedCompany={selectedCompany} advancedFilters={appliedFilters}/>
          </Box>
        </Box>
      </Box>
  );
}
