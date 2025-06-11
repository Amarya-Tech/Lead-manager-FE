import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useEncryptionKeyStore } from '../apicaller/EncryptionKeyStore.js';
import "./css/Login.css";



export default function Login() {
  const { setEncryptionKey } = useEncryptionKeyStore();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      email,
      password,
    };


    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, data, {
        withCredentials: true, 
      });
      const encryptionKeyFromHeader = response.headers['x-encryption-key'] || '';

      setEncryptionKey(encryptionKeyFromHeader);
      toast.success(response.data.message || 'Login successful!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      if (error.response && error.response.data) {
        const backendMessage = error.response.data.message;
        toast.error(backendMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
