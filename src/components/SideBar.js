import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export default function Sidebar() {
  const userRole = Cookies.get('role');
  const isAdmin = userRole === 'admin';
  const isMobile = useMediaQuery('(max-width:900px)');

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

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
    ...(isAdmin ? [{ text: 'User Management', path: '/users' }] : []),
    { text: 'My Profile', path: '/user-profile' },
  ];

  const drawerContent = (
    <div>
      <Typography
        variant="h6"
        sx={{
          fontSize: '2rem',
          mb: 4,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
          color: '#1a202c',
        }}
      >
        Lead Manager
      </Typography>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
       {menuItems.map((item) => (
          <div key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  textDecoration: 'none',
                  color: '#2d3748',
                  fontSize: '15px',
                  fontWeight: 500,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    color: '#1e40af',
                    fontWeight: 600,
                    paddingLeft: '16px',
                  },
                }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>

          {item.subItems && (
                <List sx={{ pl: 3, gap: '2px', mt: 1, borderLeft: '2px solid #e2e8f0' }}>
                  {item.subItems.map((sub) => (
                    <ListItem key={sub.text} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={sub.path}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                          textDecoration: 'none',
                          color: '#4a5568',
                          fontSize: '13.5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          marginLeft: '6px',
                          fontWeight: 400,
                          backgroundColor: '#f9fafb',
                          '&:hover': {
                            backgroundColor: '#edf2f7',
                            color: '#1e40af',
                            fontWeight: 500,
                            paddingLeft: '20px',
                          },
                        }}
                      >
                        <ListItemText primary={sub.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
          </div>
        ))}
      </List>
    </div>
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
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.03)',
            padding: '24px 20px',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
