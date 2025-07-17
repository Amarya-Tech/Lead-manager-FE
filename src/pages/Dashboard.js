import { useState } from "react";
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
  IconButton,
  InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleNewLead = () => navigate('/leads/new');
  const clearSearch = () => setSearchTerm("");

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
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb:'20px', mt:'10px'}}>
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
