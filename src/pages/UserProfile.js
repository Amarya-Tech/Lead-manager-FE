import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import './css/UserProfile.css';
import { toast } from 'react-toastify';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from '../apicaller/AuthStore.js';

const UserProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userCompanies, setUserCompanies] = useState([]);
    const [showAddBrand, setShowAddBrand] = useState(false);
    const [newBrand, setNewBrand] = useState("");
    const [editedData, setEditedData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        password: ''
    });

    const { userId } = useAuthStore();

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

    useEffect(() => {
      if (userProfile) {
        fetchUserCompanies();
      }
    }, [userProfile]);

    const handleAddBrand = async () => {
      try {
        const response = await apiClient.post("/lead/add-company-brand", {
          company_name: newBrand.trim(),
        });

        if (!response.data.success && response.status === 201) {
            toast.warning(response?.data?.message);
        } else if (response.data.success && response.status === 200){
            setNewBrand("");
            setShowAddBrand(false);
            fetchUserCompanies(); 
            toast.success("Brand added successfully.");
        } else {
            toast.error("Brand could not be added")
        }

      } catch (error) {
        console.error("Error adding brand:", error);
        alert("Error adding brand");
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

    return (
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
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
            }}>
              User Profile
            </Typography>
          </Box>

           {loading ? <CircularProgress /> : (
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
                  <Typography variant="h5" fontWeight={500}>
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
                    fontWeight: 500,
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
                        sx={{ fontWeight: 500, color: "#64748b", fontSize: 12, mb: 0.5 }}
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
                        <Typography sx={{ fontWeight: 500, fontSize: 12 }}>
                          {key === "password"
                            ? "******"
                            : userProfile[key] || "Not provided"}
                        </Typography>
                      )}
                    </Box>
                ))}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 12, mb: 0.5 }}>
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
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 12, mb: 0.5 }}>
                      User ID
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 12 }}>
                      {userProfile.id}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#64748b", fontSize: 12, mb: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 12 }}>
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 4,
                    pt: 3,
                    pb: 1,
                    fontWeight: 500,
                    bgcolor: "#fafbfc",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Managing Brands
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      fontSize: "11px",
                      backgroundColor: "#10b981",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#059669" },
                    }}
                    onClick={() => setShowAddBrand(true)}
                  >
                    + Add Brand
                  </Button>
                </Box>

                <Box sx={{ px: 4, pt: 2, pb: 3 }}>
                  {showAddBrand && (
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Brand Name"
                        variant="outlined"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        sx={{ width: "250px" }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          fontSize: "12px",
                          backgroundColor: "#2563eb",
                          "&:hover": { backgroundColor: "#1e40af" },
                        }}
                        onClick={handleAddBrand}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          fontSize: "12px",
                          color: "#6b7280",
                          borderColor: "#d1d5db",
                          "&:hover": { borderColor: "#9ca3af", color: "#374151" },
                        }}
                        onClick={() => {
                          setShowAddBrand(false);
                          setNewBrand("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {userCompanies.length > 0 ? (
                    <List dense disablePadding>
                      {userCompanies.map((company, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 0.5,
                            borderBottom:
                              index !== userCompanies.length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#162f67ff",
                            }}
                          >
                            {company.parent_company_name}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                      No managing brand present
                    </Typography>
                  )}
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
           )}
        </Box>
      </Box>
  );
};

export default UserProfilePage;
