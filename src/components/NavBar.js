import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import apiClient from '../apicaller/APIClient';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';

export default function Navbar() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const userId = Cookies.get('user_id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/user/fetch-user-detail/${userId}`);
        const user = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        if (user?.first_name) {
          setUserName(`${user.first_name} ${user.last_name || ''}`);
        }
      } catch (error) {
        console.error('Error fetching user info in navbar:', error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await apiClient.get(`/user/logout/${userId}`);
      Cookies.remove('user_id');
      Cookies.remove('jwt');
      Cookies.remove('role');
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2A262E', color: '#333', boxShadow: 1 }}>
      <Container maxWidth="l">
        <Toolbar disableGutters sx={{ justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'right', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#ffffff' }}>
              {userName}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogout}
              sx={{ color: '#fff', textTransform: 'none', '&:hover': { backgroundColor: '#A2120B' }  }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
