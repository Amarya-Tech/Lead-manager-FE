import { Link, useNavigate  } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import "./css/Register.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiurl = process.env.REACT_APP_API_URL

export default function Register() {

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            phone : Number(phone),
        };

        try {
           const response = await axios.post(`${apiurl}/user/register`, data);
            console.log(response.data)
            toast.success(response.data.message || 'Registration successful!');
             setTimeout(() => {
                navigate('/login');   
            }, 3000);  
            
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
        <h2 className="auth-title">Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
