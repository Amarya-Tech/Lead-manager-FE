import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './css/UserProfile.css';

const UserProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedStatus, setEditedStatus] = useState(false);
    const [editedRole, setEditedRole] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    
    const userId = Cookies.get("user_id")
     const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get(`/user/fetch-user-detail/${userId}`);

            let userData = null;

            if (response.data && response.data.success && response.data.data) {
                if (Array.isArray(response.data.data)) {
                    userData = response.data.data[0];
                } else {
                    userData = response.data.data;
                }
            } else if (response.data && !response.data.success) {
                userData = response.data;
            }

            if (userData) {
                setUserProfile(userData);
                setEditedRole(userData.role);
                setEditedStatus(userData.is_active === 1 || userData.is_active === true);
            } else {
                console.log('No user data found to set'); 
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
            console.log('Error response:', error.response?.data); 
        } finally {
            setLoading(false);
        }
    };

    // Add logout functionality
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);

            const response = await apiClient.get(`/user/logout/${userId}`);

            Cookies.remove('user_id');
            Cookies.remove('jwt');

            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });

        } catch (error) {
            console.error('Error during logout:', error);
            // Cookies.remove('user_id');
            // Cookies.remove('jwt');

            // localStorage.clear();
            // sessionStorage.clear();
            // navigate('/login', { replace: true });

        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleUpdateRole = async () => {
        if (editedRole && editedRole !== userProfile.role) {
            try {
                const response = await apiClient.put(`/user/update-user-role`, {
                    id:userId,
                    role: editedRole
                });
                
                if (response.data && response.data.success) {
                    fetchUserProfile();
                    setIsEditing(false);
                } else {
                    console.log('Failed to update role. Please try again.');
                }
            } catch (error) {
                console.error('Error updating role:', error);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleUpdateStatus = async () => {
        const currentStatus = userProfile.is_active === 1 || userProfile.is_active === true;
        if (editedStatus !== currentStatus) {
            try {
                const response = await apiClient.put(`/user/active-status`, {
                    id:userId,
                    is_active: editedStatus
                });
                
                if (response.data && response.data.success) {
                    fetchUserProfile();
                    setIsEditingStatus(false);
                } else {
                    console.log('Failed to update status. Please try again.');
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        } else {
            setIsEditingStatus(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedRole(userProfile.role); 
        setIsEditing(false);
    };

    const handleCancelStatusEdit = () => {
        setEditedStatus(userProfile.is_active === 1 || userProfile.is_active === true);
        setIsEditingStatus(false);
    };

    const availableRoles = ['admin', 'user'];

    if (loading) {
        return (
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="content-header">
                        <button 
                            className="logout-btn"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                    <div className="profile-container">
                        <div className="loading-spinner">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <div className="content-header">
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                    <div className="profile-container">
                        <div className="error-message">Unable to load profile</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="content-header">
                    <h1 className="page-title">User Profile</h1>
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
                <div className="profile-container">
                    <div className="profile-card">
                        {/* Profile Header with Avatar */}
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {userProfile.first_name?.[0]}{userProfile.last_name?.[0]}
                            </div>
                            <div className="profile-info">
                                <h1 className="user-name">
                                    {userProfile.first_name} {userProfile.last_name}
                                </h1>
                                <p className="user-email">{userProfile.email}</p>
                            </div>
                            <div className="role-badge">
                                {userProfile.role?.toUpperCase()}
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="about-section">
                            <h3 className="section-header">About</h3>
                            <div className="detail-row">
                                <label>Full name</label>
                                <span>{userProfile.first_name} {userProfile.last_name}</span>
                            </div>
                            <div className="detail-row">
                                <label>Role</label>
                                {isEditing ? (
                                    <select 
                                        value={editedRole} 
                                        onChange={(e) => setEditedRole(e.target.value)}
                                        className="role-dropdown"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span>{userProfile.role}</span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>Status</label>
                                {isEditingStatus ? (
                                    <select 
                                        value={editedStatus ? 'active' : 'inactive'} 
                                        onChange={(e) => setEditedStatus(e.target.value === 'active')}
                                        className="status-dropdown"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                ) : (
                                    <span className={`status ${userProfile.is_active === 1 || userProfile.is_active === true ? 'active' : 'inactive'}`}>
                                        {userProfile.is_active === 1 || userProfile.is_active === true ? 'Active' : 'Inactive'}
                                    </span>
                                )}
                            </div>

                            <div className="detail-row">
                                <label>User ID</label>
                                <span>{userProfile.id}</span>
                            </div>

                            <div className="detail-row">
                                <label>Member Since</label>
                                <span>{new Date(userProfile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="contact-section">
                            <h3 className="section-header">Contact Information</h3>
                            
                            <div className="detail-row">
                                <label>Phone</label>
                                <span>{userProfile.phone || 'Not provided'}</span>
                            </div>

                            <div className="detail-row">
                                <label>Email</label>
                                <span>{userProfile.email}</span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="profile-actions">
                            {isEditing ? (
                                <div className="edit-actions">
                                    <button 
                                        className="save-btn"
                                        onClick={handleUpdateRole}
                                    >
                                        Save Role
                                    </button>
                                    <button 
                                        className="cancel-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : isEditingStatus ? (
                                <div className="edit-actions">
                                    <button 
                                        className="save-btn"
                                        onClick={handleUpdateStatus}
                                    >
                                        Save Status
                                    </button>
                                    <button 
                                        className="cancel-btn"
                                        onClick={handleCancelStatusEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="button-group">
                                    <button 
                                        className="update-role-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit User Role
                                    </button>
                                    <button 
                                        className="update-status-btn"
                                        onClick={() => setIsEditingStatus(true)}
                                    >
                                        Edit User Status
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;