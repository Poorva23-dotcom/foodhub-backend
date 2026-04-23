import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, role = null) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', { 
        email, 
        password 
      });
      
      if (response.data.success) {
        const user = response.data.user;
        
        // If trying to login as admin, check role
        if (role === 'admin' && user.role !== 'admin') {
          setError('This account is not an admin account!');
          setLoading(false);
          return;
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        setMessage(`Welcome ${user.name}! Redirecting...`);
        
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div style={{ fontSize: '4rem' }}>🍕</div>
              <h2 className="fw-bold mt-2">Welcome Back!</h2>
              <p className="text-muted">Login to your FoodHub account</p>
            </div>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={(e) => handleLogin(e, null)}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-danger w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'User Login →'}
              </button>
            </form>
            
            <hr className="my-3" />
            
            {/* Admin Login Button */}
            <button 
              onClick={(e) => handleLogin(e, 'admin')}
              className="btn btn-outline-danger w-100 py-2 fw-bold"
              disabled={loading}
            >
              👑 Login as Admin
            </button>
            
            <hr className="my-4" />
            
            <div className="text-center">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="text-danger fw-bold">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;