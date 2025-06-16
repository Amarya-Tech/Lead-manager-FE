import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './css/UserProfile.css';
import Navbar from '../components/NavBar.js';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
  Chip,
  Paper,
} from "@mui/material";

const UserProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        password: ''
    });

    const userId = Cookies.get("user_id");
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get(`/user/fetch-user-detail/${userId}`);
            let userData = null;

            if (response.data && response.data.success && response.data.data) {
                userData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
            } else if (response.data && !response.data.success) {
                userData = response.data;
            }

            if (userData) {
                setUserProfile(userData);
                setEditedData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    phone: userData.phone || '',
                    password: ''
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            phone: userProfile.phone,
            password: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const payload = { id: userId, ...editedData };
            if (!payload.password) delete payload.password;
            const response = await apiClient.put(`/user/update-user/${userId}`, payload);
            if (response.data.success) {
                fetchUserProfile();
                setIsEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!userProfile) return <div>Unable to load profile</div>;

    return (
    <>
      <Navbar />
      <Box display="flex" sx={{
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
      }}>
        <Sidebar />
        <Box component="main"  sx={{
              flexGrow: 1,
              p: 3,
              ml: '24px',  
              width: 'calc(100% - 240px)',      
            }}>
          <Box
           display="flex" justifyContent="space-between" alignItems="center" sx={{mb:'20px', mt:'10px'}}>
            <Typography variant="h5" sx={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
            }}>
              User Profile
            </Typography>
          </Box>

          <Container maxWidth="md">
            <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 2,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#3b82f6",
                    fontSize: 24,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {userProfile.first_name?.[0]}
                  {userProfile.last_name?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {userProfile.first_name} {userProfile.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userProfile.email}
                  </Typography>
                </Box>
                <Chip
                  label={userProfile.role?.toUpperCase()}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    fontSize: 12,
                    borderRadius: "16px",
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    px: 4,
                    pt: 3,
                    pb: 1,
                    fontWeight: 600,
                    bgcolor: "#fafbfc",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  About
                </Typography>

                 <Box sx={{ px: 4, pt: 2 }}>
                  {[
                    { key: "first_name", label: "First Name" },
                    { key: "last_name", label: "Last Name" },
                    { key: "phone", label: "Phone" },
                    { key: "password", label: "Password" },
                  ].map(({ key, label }) => (
                    <Box
                      key={key}
                      sx={{
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 500, color: "#64748b", fontSize: 14, mb: 0.5 }}
                      >
                        {label}
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          name={key}
                          value={editedData[key]}
                          type={key === "password" ? "text" : "text"}
                          placeholder={key === "password" ? "Enter new password" : ""}
                          onChange={handleChange}
                          size="small"
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                          {key === "password"
                            ? "******"
                            : userProfile[key] || "Not provided"}
                        </Typography>
                      )}
                    </Box>
                ))}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 14, mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={userProfile.is_active ? "Active" : "Inactive"}
                      sx={{
                        bgcolor: userProfile.is_active ? "#dcfce7" : "#fee2e2",
                        color: userProfile.is_active ? "#166534" : "#991b1b",
                        fontWeight: 500,
                        fontSize: 12,
                        textTransform: "uppercase",
                        borderRadius: "16px",
                      }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 14, mb: 0.5 }}>
                      User ID
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                      {userProfile.id}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 14, mb: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 2,
                  bgcolor: "#fafbfc",
                  borderTop: "1px solid #f1f5f9",
                  flexWrap: "wrap",
                }}
              >
                {isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCancel}
                      sx={{ bgcolor: "#6b7280", "&:hover": { bgcolor: "#4b5563" } }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                   variant="contained" 
                    onClick={handleEditToggle} sx={{ fontSize: '13px', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' }, textTransform: 'none'  }}
                  >
                    Update Profile
                  </Button>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default UserProfilePage;
