import { useState } from "react";
import AdminSidebar from "../components/AdminSideBar.js";
import CsvUploadPage from "../components/ImportExcel.js"; 
import {
  Box,
  Button,
  Typography,
} from '@mui/material';

export default function HomePage() {
  const [showImport, setShowImport] = useState(false);

  const handleToggleImport = () => {
    setShowImport((prev) => !prev);
  };

  return (
    <Box display="flex" sx={{ fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`}}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{ 
              flexGrow: 1,
              p: 3,
              width: 'calc(100% - 240px)',
            }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb:'20px', mt:'10px'}}>
          <Typography variant="h5" sx={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
            }}
          > Admin Dashboard </Typography>

          <Button
            variant="contained"
            color="primary"
            className="primary-button"
            onClick={handleToggleImport}
            sx={{fontSize:'12px'}}
          >
            {showImport ? 'Hide Import' : 'Import Excel'}
          </Button>
        </Box>

        {/* Conditionally render ImportExcel component here */}
        {showImport && (
            <CsvUploadPage />
        )}
      </Box>
    </Box>
  );
} 
