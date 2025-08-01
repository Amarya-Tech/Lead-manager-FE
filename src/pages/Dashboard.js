import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/SideBar.js";
import LeadsTable from "../components/LeadsTable.js";
import "./css/Leads.css";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuthStore } from "../apicaller/AuthStore.js";
import apiClient from "../apicaller/APIClient.js";

export default function Dashboard() {
  const { userId, role } = useAuthStore();
  const userRole = role;
  const [searchTerm, setSearchTerm] = useState("");
  const [leadCounts, setLeadCounts] = useState(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleNewLead = () => navigate('/leads/new');
  const clearSearch = () => setSearchTerm("");

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

          {(userRole === 'admin' || userRole === 'super admin') && (
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
            </>
          )}
        </Box>
        <Box position="relative" mb={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search leads by company name, industry type, product and sales rep..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} title="Clear search">
                    <ClearIcon sx={{ color: '#666' }} />
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

        <LeadsTable searchTerm={searchTerm} />
      </Box>
    </Box>
  );
}
