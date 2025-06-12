import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput.js';
import Cookies from 'js-cookie';
import './css/Users.css';
import Navbar from '../components/NavBar.js';

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

    // Update User form states
    const [editedData, setEditedData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        role: ''
    });

    useEffect(() => {
        fetchUserList();
    }, []);

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

    const handleAddUser = () => {
        setShowAddUserModal(true);
    };

    const handleCloseModal = () => {
        setShowAddUserModal(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateUserModal(false);
        setSelectedUser(null);
        setSelectedUserId(null);
        setEditedData({
            first_name: '',
            last_name: '',
            phone: '',
            password: '',
            role: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password || !role) {
            setShowErrors(true);
            return;
        }
        setShowErrors(false);
        setIsSubmitting(true);
        try {
            const response = await apiClient.post(`/user/add-new-user`, {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                phone: Number(phone),
                role
            });
            toast.success(response.data.message || 'User added successfully');
            handleCloseModal();
            fetchUserList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unexpected error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = (user) => {
        setSelectedUser(user);
        setSelectedUserId(user.id);
        setEditedData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            password: '',
            role: user.role || ''
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
                fetchUserList();
                handleCloseUpdateModal();
            } else {
                toast.error('Failed to update user');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating user');
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
                id: selectedUserId,
                is_active: editedStatus
            });
            if (response.data?.success) {
                toast.success("Status updated");
                fetchUserList();
            } else toast.error("Failed to update status");
        } catch (error) {
            toast.error("Error updating status");
        } finally {
            setIsEditingStatus(false);
            setSelectedUserId(null);
        }
    };

    return (
        <>
        <Navbar />
        <div className="user-page">
            <Sidebar />
            <div className="main-content">
                <div className="content-header">
                    <h1 className="page-title">Users List</h1>
                    <button className="add-user-btn" onClick={handleAddUser}>+ Add New User</button>
                </div>
                {loading ? <div>Loading...</div> : (
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map((user, index) => (
                                <tr key={user.id || index}>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.role}</td>
                                    <td className={user.is_active ? 'status-active' : 'status-inactive'}>
                                        {isEditingStatus && selectedUserId === user.id ? (
                                                <select value={editedStatus ? 'true' : 'false'} onChange={e => setEditedStatus(e.target.value === 'true')}>
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                        ) : user.is_active ? 'Active' : 'Inactive'}
                                    </td> 
                                    <td>
                                        <button onClick={() => handleUpdateUser(user)} style={{ marginRight: "20px" }}>
                                            Update User
                                        </button>
                                        <button onClick={() => {
                                            setIsEditingStatus(true);
                                            setSelectedUserId(user.id);
                                            setEditedStatus(user.is_active);
                                            setSelectedUser(user);
                                        }}>Update Status</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {isEditingStatus && (
                    <div className="edit-actions">
                        <button className="save-btn" onClick={handleUpdateStatus}>Save Status</button>
                        <button className="cancel-btn" onClick={() => { setIsEditingStatus(false); setSelectedUserId(null); }}>Cancel</button>
                    </div>
                )}

                {/* Add User Modal */}
                {showAddUserModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>Add New User</h2>
                                <button onClick={handleCloseModal}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <FormInput placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} showErrors={showErrors} />
                                <FormInput placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} showErrors={showErrors} />
                                <FormInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} showErrors={showErrors} />
                                <div className="form-group">
                                    <input type="password" placeholder="Password" value={password} readOnly required />
                                </div>
                                <div className="form-group">
                                    <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <select value={role} onChange={e => setRole(e.target.value)} required>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add User'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Update User Modal */}
                {showUpdateUserModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>Update User</h2>
                                <button onClick={handleCloseUpdateModal}>×</button>
                            </div>
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input 
                                        name="first_name" 
                                        value={editedData.first_name} 
                                        onChange={handleUpdateChange}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        name="last_name" 
                                        value={editedData.last_name} 
                                        onChange={handleUpdateChange}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input 
                                        name="phone" 
                                        value={editedData.phone} 
                                        onChange={handleUpdateChange}
                                        placeholder="Phone"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select 
                                        name="role" 
                                        value={editedData.role} 
                                        onChange={handleUpdateChange}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>New Password (optional)</label>
                                    <input 
                                        name="password" 
                                        type="text" 
                                        value={editedData.password} 
                                        onChange={handleUpdateChange}
                                        placeholder="Enter new password (leave blank to keep current)"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={handleCloseUpdateModal}>Cancel</button>
                                    <button type="button" onClick={handleSaveUpdate} disabled={isSubmitting}>
                                        {isSubmitting ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default UserPage;