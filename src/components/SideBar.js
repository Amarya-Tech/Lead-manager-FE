import { Link, useNavigate  } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  Box,
  Divider,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect  } from 'react';
import apiClient from '../apicaller/APIClient';
import { useAuthStore } from '../apicaller/AuthStore';

export default function Sidebar() {
  
  const { userId, role} = useAuthStore();
  const userRole = role;
  const isAdmin = userRole === 'admin';
  const isSuperAdmin = userRole === 'super_admin';
  const isMobile = useMediaQuery('(max-width:900px)');
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

 useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/user/fetch-user-detail/${userId}`);
        const user = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        if (user?.first_name) {
          setUserName(`${user.first_name} ${user.last_name || ''}`);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
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

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    {
    text: 'Leads',
    path: '/leads',
    subItems: [
      { text: 'New Lead', path: '/leads/status/lead' },
      { text: 'Prospect', path: '/leads/status/prospect' },
      { text: 'Active Prospect', path: '/leads/status/active prospect' },
      { text: 'Customer', path: '/leads/status/customer' },
      { text: 'Expired Lead', path: '/leads/status/expired lead' }
    ]
  },
    ...(isAdmin || isSuperAdmin ? [{ text: 'User Management', path: '/users' }] : []),
    ...(isSuperAdmin ? [{ text: 'Upload Sheet', path: '/upload-sheet' }] : []),
    { text: 'My Profile', path: '/user-profile' },
  ];

  const drawerContent = (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontSize: '24px',
          mb: 2,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
          color: '#1a202c',
        }}
      >
        Lead Manager
      </Typography>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: '12px'}}>
       {menuItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  textDecoration: 'none',
                  color: '#2d3748',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    color: '#1e40af',
                    fontWeight: 600,
                    paddingLeft: '8px',
                  },
                }}
              >
                {item.text}
              </ListItemButton>
            </ListItem>

          {item.subItems && (
                <List sx={{ pl: 1, gap: '2px', mt: 1, borderLeft: '2px solid #e2e8f0', width: 150 }}>
                  {item.subItems.map((sub) => (
                    <ListItem key={sub.text} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={sub.path}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                          textDecoration: 'none',
                          color: '#4a5568',
                          fontSize: '12px',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          marginLeft: '6px',
                          fontWeight: 400,
                          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#edf2f7',
                            color: '#1e40af',
                            fontWeight: 500,
                            paddingLeft: '20px',
                          },
                        }}
                      >
                        {sub.text}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
          </Box>
        ))}
      </List>

      <Divider sx={{ my: 3 }} />

      {/* User Info & Logout */}
      <Box
          sx={{
            mt: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            paddingTop: 1,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#3b82f6",
              fontSize: 16,
              fontWeight: 600,
              color: "white",
            }}
          >
            {userName?.charAt(0)}
          </Avatar>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: '#1a202c',
              fontSize: '12px',
            }}
          >
            {userName}
          </Typography>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            fullWidth
            sx={{
              color: '#fff',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '12px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#A2120B',
              },
            }}
          >
            Logout
          </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
          sx={{ position: 'fixed', top: 16, left: 20, zIndex: 1201, color: '#fff' }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        sx={{
          width: 180,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 180,
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)',
            padding: '24px 12px',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
