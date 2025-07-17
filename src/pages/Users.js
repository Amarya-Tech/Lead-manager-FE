
import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
    Box, Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Select, MenuItem, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, InputLabel, FormControl,  InputAdornment,IconButton
} from '@mui/material';

const UserPage = () => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedStatus, setEditedStatus] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("Test@34@56");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("user");
    const [showErrors, setShowErrors] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [editedData, setEditedData] = useState({
        first_name: '', last_name: '', phone: '', password: '', role: ''
    });

    useEffect(() => { fetchUserList(); }, []);

    const fetchUserList = async () => {
        try {
            const response = await apiClient.get(`/user/fetch-all-user-list`);
            let userData = response.data?.data;
            if (!Array.isArray(userData)) userData = [userData];
            setUserList(userData);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => setShowAddUserModal(true);

    const handleCloseModal = () => {
        setShowAddUserModal(false);
        setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateUserModal(false);
        setSelectedUser(null); setSelectedUserId(null);
        setEditedData({ first_name: '', last_name: '', phone: '', password: '', role: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password || !role) {
            setShowErrors(true);
            return;
        }
        setShowErrors(false); setIsSubmitting(true);
        try {
            const response = await apiClient.post(`/user/add-new-user`, {
                first_name: firstName, last_name: lastName, email,
                password, phone: Number(phone), role
            });
            toast.success(response.data.message || 'User added successfully');
            handleCloseModal(); fetchUserList();
        } catch (error) {
            const backendMessage = error.response?.data?.errors[0].msg || 'Something went wrong.';
            toast.error(backendMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = (user) => {
        setSelectedUser(user); setSelectedUserId(user.id);
        setEditedData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            password: '', role: user.role || ''
        });
        setShowUpdateUserModal(true);
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveUpdate = async () => {
        try {
            setIsSubmitting(true);
            const payload = { id: selectedUserId, ...editedData };
            if (!payload.password) delete payload.password;
            const response = await apiClient.put(`/user/update-user/${selectedUserId}`, payload);
            if (response.data.success) {
                toast.success('User updated successfully');
                fetchUserList(); handleCloseUpdateModal();
            } else toast.error('Failed to update user');
        } catch (error) {
            const backendMessage = error.response?.data?.errors[0].msg || 'Error updating user';
            toast.error(backendMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedUserId || editedStatus === selectedUser.is_active) {
            setIsEditingStatus(false);
            return;
        }
        try {
            const response = await apiClient.put(`/user/active-status`, {
                id: selectedUserId, is_active: editedStatus
            });
            if (response.data?.success) {
                toast.success("Status updated"); fetchUserList();
            } else toast.error("Failed to update status");
        } catch (error) {
            toast.error("Error updating status");
        } finally {
            setIsEditingStatus(false); setSelectedUserId(null);
        }
    };
    return (
        <Box display="flex">
            <Sidebar />
            <Box component="main"
                sx={{
                flexGrow: 1,
                p: 3,
                ml: '24px',  
                width: 'calc(100% - 240px)',
                }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb:'20px', mt:'10px'}}>
                    <Typography variant="h5" sx={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: '#000000',
                        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
                        }}>Users List</Typography>
                    <Button variant="contained" color="primary" className="primary-button" onClick={handleAddUser} sx={{ fontSize:'12px'}}>+ Add New User</Button>
                </Box>
                {loading ? <CircularProgress /> : (
                    <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid #ddd' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f4f4f4', height: 18, '& th': { fontWeight: 'bold' } }}>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Name</strong></TableCell>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}} ><strong>Email</strong></TableCell>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Phone</strong></TableCell>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Role</strong></TableCell>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Status</strong></TableCell>
                                    <TableCell sx={{ fontSize:'12px', paddingTop: '8px', paddingBottom: '8px'}}><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userList.map((user) => (
                                    <TableRow key={user.id} sx={{
                                        '& td': {
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                            lineHeight: '1.2',
                                        },
                                        height: 18
                                        }}>
                                        <TableCell sx={{ fontSize:'12px'}}>{user.first_name} {user.last_name}</TableCell>
                                        <TableCell sx={{ fontSize:'12px'}}>{user.email}</TableCell>
                                        <TableCell sx={{ fontSize:'12px'}}>{user.phone}</TableCell>
                                        <TableCell sx={{ fontSize:'12px'}}>{user.role}</TableCell>
                                        <TableCell>
                                            {isEditingStatus && selectedUserId === user.id ? (
                                                <Select
                                                    value={editedStatus ? 'true' : 'false'}
                                                    onChange={(e) => setEditedStatus(e.target.value === 'true')}
                                                    size="small"
                                                >
                                                    <MenuItem value="true">Active</MenuItem>
                                                    <MenuItem value="false">Inactive</MenuItem>
                                                </Select>
                                            ) : (
                                                <Typography
                                                sx={{
                                                    color: user.is_active ? 'green' : 'red',
                                                    fontWeight: 500,
                                                }}
                                                >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleUpdateUser(user)} variant="contained" sx={{ fontSize: '12px', mr: '10px', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' }, textTransform: 'none'  }}>Update User</Button>
                                            <Button onClick={() => {
                                                setIsEditingStatus(true);
                                                setSelectedUserId(user.id);
                                                setEditedStatus(user.is_active);
                                                setSelectedUser(user);
                                            }} variant="contained" sx={{ fontSize: '12px', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' }, textTransform: 'none'  }}>Update Status</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {isEditingStatus && (
                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="contained" onClick={handleUpdateStatus}>Save Status</Button>
                        <Button variant="outlined" onClick={() => { setIsEditingStatus(false); setSelectedUserId(null); }}>Cancel</Button>
                    </Box>
                )}

                {/* Add User Modal */}
                <Dialog open={showAddUserModal} onClose={handleCloseModal} fullWidth>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogContent>
                        <TextField label="First Name" fullWidth margin="dense" value={firstName} onChange={e => setFirstName(e.target.value)} error={showErrors && !firstName} />
                        <TextField label="Last Name" fullWidth margin="dense" value={lastName} onChange={e => setLastName(e.target.value)} error={showErrors && !lastName} />
                        <TextField label="Email" fullWidth margin="dense" type="email" value={email} onChange={e => setEmail(e.target.value)} error={showErrors && !email} />
                        <TextField label="Password" fullWidth margin="dense" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} 
                            InputProps={{
                                          endAdornment: (
                                            <InputAdornment position="end">
                                              <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                              </IconButton>
                                            </InputAdornment>
                                          ),
                                        }}/>
                        <TextField label="Phone" fullWidth margin="dense" value={phone} onChange={e => setPhone(e.target.value)} />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Role</InputLabel>
                            <Select value={role} onChange={e => setRole(e.target.value)} required label="Role">
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add User'}</Button>
                    </DialogActions>
                </Dialog>

                {/* Update User Modal */}
                <Dialog open={showUpdateUserModal} onClose={handleCloseUpdateModal} fullWidth>
                    <DialogTitle>Update User</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth margin="dense" label="First Name" name="first_name" value={editedData.first_name} onChange={handleUpdateChange} />
                        <TextField fullWidth margin="dense" label="Last Name" name="last_name" value={editedData.last_name} onChange={handleUpdateChange} />
                        <TextField fullWidth margin="dense" label="Phone" name="phone" value={editedData.phone} onChange={handleUpdateChange} />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Role</InputLabel>
                            <Select name="role" value={editedData.role} onChange={handleUpdateChange} label="Role">
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth margin="dense" label="New Password (optional)" name="password" type={showPassword ? 'text' : 'password'} value={editedData.password} onChange={handleUpdateChange}
                         InputProps={{
                                          endAdornment: (
                                            <InputAdornment position="end">
                                              <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                              </IconButton>
                                            </InputAdornment>
                                          ),
                                        }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpdateModal}>Cancel</Button>
                        <Button onClick={handleSaveUpdate} disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update User'}</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default UserPage;
