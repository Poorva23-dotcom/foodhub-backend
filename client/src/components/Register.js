import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'user'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: formData.role
      });
      
      if (response.data.success) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-4 mb-5">
      <div className="col-md-6">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div style={{ fontSize: '4rem' }}>🍽️</div>
              <h2 className="fw-bold mt-2">Create Account</h2>
              <p className="text-muted">Join FoodHub and start ordering!</p>
            </div>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Password *</label>
                  <input 
                    type="password" 
                    name="password"
                    className="form-control" 
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Confirm Password *</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="form-control" 
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Role *</label>
                <select 
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">👤 Regular User</option>
                  <option value="admin">👑 Admin</option>
                </select>
                <small className="text-muted">Admin accounts can manage products and orders</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-control" 
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Address</label>
                <textarea 
                  name="address"
                  className="form-control" 
                  placeholder="Enter your delivery address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-danger w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register →'}
              </button>
            </form>
            
            <hr className="my-4" />
            
            <div className="text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-danger fw-bold">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;