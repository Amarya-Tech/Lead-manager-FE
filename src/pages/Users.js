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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedStatus, setEditedStatus] = useState(false);
    const [editedRole, setEditedRole] = useState('');

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("Test@34@56");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("user");
    const [showErrors, setShowErrors] = useState(false);

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

    const handleUpdateRole = async () => {
        if (!selectedUserId || editedRole === selectedUser.role) {
            setIsEditing(false);
            return;
        }
        try {
            const response = await apiClient.put(`/user/update-user-role`, {
                id: selectedUserId,
                role: editedRole
            });
            if (response.data?.success) {
                toast.success("Role updated");
                fetchUserList();
            } else toast.error("Failed to update role");
        } catch (error) {
            toast.error("Error updating role");
        } finally {
            setIsEditing(false);
            setSelectedUserId(null);
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
                                    <td>
                                        {isEditing && selectedUserId === user.id ? (
                                            <select value={editedRole} onChange={e => setEditedRole(e.target.value)}>
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : user.role}
                                    </td>
                                    <td className={user.is_active ? 'status-active' : 'status-inactive'}>
                                        {isEditingStatus && selectedUserId === user.id ? (
                                                <select value={editedStatus ? 'true' : 'false'} onChange={e => setEditedStatus(e.target.value === 'true')}>
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                        ) : user.is_active ? 'Active' : 'Inactive'}
                                    </td> 
                                    <td>
                                        <button onClick={() => {
                                            setIsEditing(true);
                                            setSelectedUserId(user.id);
                                            setEditedRole(user.role);
                                            setSelectedUser(user);
                                        }} style={{ marginRight: "20px" }}>Edit Role</button>
                                        <button onClick={() => {
                                            setIsEditingStatus(true);
                                            setSelectedUserId(user.id);
                                            setEditedStatus(user.is_active);
                                            setSelectedUser(user);
                                        }}>Edit Status</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {(isEditing || isEditingStatus) && (
                    <div className="edit-actions">
                        {isEditing && (
                            <>
                                <button className="save-btn" onClick={handleUpdateRole}>Save Role</button>
                                <button className="cancel-btn" onClick={() => { setIsEditing(false); setSelectedUserId(null); }}>Cancel</button>
                            </>
                        )}
                        {isEditingStatus && (
                            <>
                                <button className="save-btn" onClick={handleUpdateStatus}>Save Status</button>
                                <button className="cancel-btn" onClick={() => { setIsEditingStatus(false); setSelectedUserId(null); }}>Cancel</button>
                            </>
                        )}
                    </div>
                )}

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
            </div>
        </div>
        </>
    );
};

export default UserPage;
