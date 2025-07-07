import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useEncryptionKeyStore } from '../apicaller/EncryptionKeyStore.js';

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';

export default function Login() {
  const { setEncryptionKey } = useEncryptionKeyStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {
      email: email ? '' : 'Email is required',
      password: password ? '' : 'Password is required',
    };
    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/login`,
        { email, password },
        { withCredentials: true }
      );

      const encryptionKeyFromHeader = response.headers['x-encryption-key'] || '';
      setEncryptionKey(encryptionKeyFromHeader);
      toast.success(response.data.message || 'Login successful!');

      const userRole = response.data.data[0].role;
      setTimeout(() => {
        if(userRole == 'super_admin'){
             navigate('/admin-dashboard');
        }else{
            navigate('/dashboard');
        }
      }, 1000);

    } catch (error) {
      const backendMessage = error?.response?.data?.message || 'An unexpected error occurred';
      toast.error(backendMessage);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={4} sx={{ padding: 4, mt: 40, borderRadius: 3 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#333',
          }}
        >
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
