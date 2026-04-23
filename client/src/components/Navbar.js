import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          🍕 FoodHub
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/">🏠 Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/all-products">📋 Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/cart">🛒 Cart</Link>
            </li>
            <li className="nav-item">
  <Link className="nav-link fw-semibold" to="/orders">📦 Orders</Link>
</li>
            
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle fw-semibold" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                    👤 {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><span className="dropdown-item-text">📧 {user.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={handleLogout} className="dropdown-item text-danger">🚪 Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/login">🔐 Login</Link>
                </li>
                {user?.role === 'admin' && (
  <li className="nav-item">
    <Link className="nav-link fw-semibold" to="/admin">👑 Admin</Link>
  </li>
)}
                <li className="nav-item">
                  <Link className="nav-link fw-semibold btn btn-danger text-white px-3 ms-2" style={{ borderRadius: '25px' }} to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;