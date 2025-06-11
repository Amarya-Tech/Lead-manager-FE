// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import apiClient from '../apicaller/APIClient';
import './css/NavBar.css';

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
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-user">{userName || 'User'}</div>
      <button className="navbar-logout" onClick={handleLogout}>Logout</button>
    </div>
  );
}
