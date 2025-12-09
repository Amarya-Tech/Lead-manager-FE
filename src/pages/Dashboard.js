import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/SideBar.js";
import LeadsTable from "../components/LeadsTable.js";
import DownloadIcon from '@mui/icons-material/Download';
import "./css/Leads.css";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  IconButton,
  Drawer, 
  InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import Chip from '@mui/material/Chip';
import { useAuthStore } from "../apicaller/AuthStore.js";
import apiClient from "../apicaller/APIClient.js";

export default function Dashboard() {
  const { userId, role } = useAuthStore();
  const userRole = role;
  const [searchTerm, setSearchTerm] = useState("");
  const [leadCounts, setLeadCounts] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);


  // Advanced search fields
  const [filters, setFilters] = useState({
    companyName: "",
    product: "",
    industryType: "",
    assignedPerson: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
      companyName: "",
      product: "",
      industryType: "",
      assignedPerson: ""
    });
      const navigate = useNavigate();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleNewLead = () => navigate('/leads/new');
  const clearSearch = () => setSearchTerm("");

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
    industryType: "",
    assignedPerson: ""
  });
  };

  // const downloadLeadsInCsv = async () => {
  //   try{
  //     let response, companyId = null;
  //     const company_name = userCompanies.filter((company) => company.id == selectedCompany);
  //     const downloadBySelectedCompany = company_name.length == 0 ? "All Brands" : company_name[0].parent_company_name;
  //     response = await apiClient.get(`/lead/export-leads/${userId}?parent_company_name=${downloadBySelectedCompany}` , {
  //       responseType : 'blob'
  //     });
  //     const blob = new Blob([response.data], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);

  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = downloadBySelectedCompany ? `${downloadBySelectedCompany}-leads.csv` : `all-leads.csv`;

  //   document.body.appendChild(link);
  //   link.click();

  //   link.remove();
  //   window.URL.revokeObjectURL(url);
  //   }catch(error){
  //     console.error("Failed to fetch leads:", error);
  //   }
  // }

  useEffect(() => {
    const fetchLeadCounts = async () => {
      try {
        let response;
        const action = "";
        response = await apiClient.get(`/lead/fetch-lead-type-count/${userId}`);
        if (Array.isArray(response.data.data)) {
          setLeadCounts(response.data.data[0])
        } else {
          console.error("Invalid data format:", response.data);
          setLeadCounts([]);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        setLeadCounts([]);
      }
    };

    fetchLeadCounts();
  }, [userId]);

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
            color: '#000000',
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
          }}>Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className="primary-button"
            onClick={handleNewLead}
            sx={{
              fontSize: '11px',
            }}
          >
            New Lead
          </Button>
        </Box>

        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          mb={3}
        >
          {/* Inactive Leads */}
          <Card
            onClick={() => navigate('/leads/inactive')}
            sx={{
              width: 180,
              height: 60,
              cursor: 'pointer',
              bgcolor: '#fcd3ddff',
              p: 2,
              boxShadow: 2,
            }}
          >
            <Typography fontWeight="bold" fontSize={14} sx={{ color: '#7b414fff' }}>Inactive Leads</Typography>
            <Typography fontSize={12} sx={{ color: '#cb7288ff' }}>No activity in 2+ weeks</Typography>
            <Typography component="span" fontSize={18} fontWeight="bold" sx={{ color: '#d03e62ff' }}>
              {leadCounts?.inactive_leads ?? '...'}
            </Typography>
            <Typography component="span" fontSize={12} sx={{ color: '#d03e62ff', ml: 0.5 }}>
              /{leadCounts?.total_leads ?? '...'}
            </Typography>
          </Card>
          {/* Possible Inactive Leads */}
          <Card
            onClick={() => navigate('/leads/possible-inactive')}
            sx={{
              width: 180,
              height: 60,
              cursor: 'pointer',
              bgcolor: '#fef9c2',
              p: 2,
              boxShadow: 2,
            }}
          >
            <Typography fontWeight="bold" fontSize={14} sx={{ color: '#7f672e' }}>Leads at Risk of Inactivity</Typography>
            <Typography fontSize={12} sx={{ color: '#e1c872' }}>Leads idle for 10+ days</Typography>
            <Typography component="span" fontSize={18} fontWeight="bold" sx={{ color: '#d69c17ff' }}>
              {leadCounts?.possible_inactive_leads ?? '...'}
            </Typography>
            <Typography component="span" fontSize={12} sx={{ color: '#d69c17ff', ml: 0.5 }}>
              /{leadCounts?.total_leads ?? '...'}
            </Typography>
          </Card>

          {(userRole === 'admin' || userRole === 'super_admin') && (
            <>
              {/* Assigned Leads */}
              <Card
                onClick={() => navigate('/leads/assigned')}
                sx={{
                  width: 180,
                  height: 60,
                  cursor: 'pointer',
                  bgcolor: '#dcfce7',
                  p: 2,
                  boxShadow: 2,
                }}
              >
                <Typography fontWeight="bold" fontSize={14} sx={{ color: '#4e8161' }}>Assigned Leads</Typography>
                <Typography fontSize={12} sx={{ color: '#96cead' }}>Leads assigned to a user</Typography>
                <Typography component="span" fontSize={18} fontWeight="bold" sx={{ color: '#16b14f' }}>
                  {leadCounts?.assigned_leads ?? '...'}
                </Typography>
                <Typography component="span" fontSize={12} sx={{ color: '#16b14f', ml: 0.5 }}>
                  /{leadCounts?.total_leads ?? '...'}
                </Typography>
              </Card>
              {/* Unassigned Leads */}
              <Card
                onClick={() => navigate('/leads/unassigned')}
                sx={{
                  width: 180,
                  height: 60,
                  cursor: 'pointer',
                  bgcolor: '#dbeaff',
                  p: 2,
                  boxShadow: 2,
                }}
              >
                <Typography fontWeight="bold" fontSize={14} sx={{ color: '#425797' }}>Unassigned Leads</Typography>
                <Typography fontSize={12} sx={{ color: '#7897da' }}>No user assigned</Typography>
                <Typography component="span" fontSize={18} fontWeight="bold" sx={{ color: '#1038afff' }}>
                  {leadCounts?.unassigned_leads ?? '...'}
                </Typography>
                <Typography component="span" fontSize={12} sx={{ color: '#1038afff', ml: 0.5 }}>
                  /{leadCounts?.total_leads ?? '...'}
                </Typography>
              </Card>
              {/* Todays Followups */}
              <Card
                onClick={() => navigate('/leads/followups')}
                sx={{
                  width: 180,
                  height: 60,
                  cursor: 'pointer',
                  bgcolor: '#ffdbf5ff',
                  p: 2,
                  boxShadow: 2,
                }}
              >
                <Typography fontWeight="bold" fontSize={14} sx={{ color: '#933b7aff' }}>FollowUp Leads</Typography>
                <Typography fontSize={12} sx={{ color: '#d979beff' }}>Followups for Today</Typography>
                <Typography component="span" fontSize={18} fontWeight="bold" sx={{ color: '#cf41a7ff' }}>
                  {leadCounts?.today_followups ?? '...'}
                </Typography>
                <Typography component="span" fontSize={12} sx={{ color: '#cf41a7ff', ml: 0.5 }}>
                  /{leadCounts?.total_leads ?? '...'}
                </Typography>
              </Card>
            </>
          )}
        </Box>

        {/*Filter by Company/Brand  */}
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
          {/* {(userRole === "super_admin" && searchTerm === '') && <DownloadIcon onClick={() => downloadLeadsInCsv()}/> } */}
        </Box>

        {/* Search Box For Advanced Search*/}
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
                      <ClearIcon sx={{ color: '#666' }} />
                    </IconButton>
                  )}
                  <IconButton onClick={() => setAdvancedOpen(true)} title="Advanced Search">
                    <TuneIcon sx={{ color: '#303840ff' }} />
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
          <Box sx={{ width: 350, p: 2 }}>
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
            <TextField
              name="assignedPerson"
              label="Assigned Person"
              value={filters.assignedPerson}
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
              backgroundColor: '#e7f3ff',
              border: '1px solid #b3d9ff',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#0056b3'
            }}
          >
            {searchTerm.trim() ? `Searching for: "${searchTerm}"` : ""}
          </Paper>
        )}

        <LeadsTable searchTerm={searchTerm} selectedCompany={selectedCompany} advancedFilters={appliedFilters}/>
      </Box>
    </Box>
  );
}
