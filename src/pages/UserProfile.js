import React, { useState, useEffect } from 'react';
import apiClient from "../apicaller/APIClient.js";
import Sidebar from "../components/SideBar.js";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './css/UserProfile.css';
import Navbar from '../components/NavBar.js';

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

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await apiClient.get(`/user/logout/${userId}`);
            Cookies.remove('user_id');
            Cookies.remove('jwt');
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoggingOut(false);
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
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="content-header">
                    <h1 className="page-title">User Profile</h1>
                    {/* <button className="logout-btn" onClick={handleLogout} disabled={isLoggingOut}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button> */}
                </div>

                <div className="profile-container">
                    <div className="profile-card">
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
                            <div className="role-badge">{userProfile.role?.toUpperCase()}</div>
                        </div>

                        <div className="about-section">
                            <h3 className="section-header">About</h3>

                            <div className="detail-row">
                                <label>First Name</label>
                                {isEditing ? (
                                    <input name="first_name" value={editedData.first_name} onChange={handleChange} />
                                ) : <span>{userProfile.first_name}</span>}
                            </div>

                            <div className="detail-row">
                                <label>Last Name</label>
                                {isEditing ? (
                                    <input name="last_name" value={editedData.last_name} onChange={handleChange} />
                                ) : <span>{userProfile.last_name}</span>}
                            </div>

                            <div className="detail-row">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input name="phone" value={editedData.phone} onChange={handleChange} />
                                ) : <span>{userProfile.phone || 'Not provided'}</span>}
                            </div>

                            <div className="detail-row">
                                <label>Password</label>
                                {isEditing ? (
                                    <input name="password" type="text" value={editedData.password} onChange={handleChange} placeholder="Enter new password"/>
                                ) : <span>******</span>}
                            </div>

                            <div className="detail-row">
                                <label>Status</label>
                                <span className={`status ${userProfile.is_active ? 'active' : 'inactive'}`}>
                                    {userProfile.is_active ? 'Active' : 'Inactive'}
                                </span>
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

                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button className="save-btn" onClick={handleSave} style={{marginRight : "20px"}}>Save</button>
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                </>
                            ) : (
                                <button className="edit-btn" onClick={handleEditToggle}>Update Profile</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default UserProfilePage;
