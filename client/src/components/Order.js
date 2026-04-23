import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoading(false);
      return;
    }
    setUser(JSON.parse(userData));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Pending', color: 'warning' },
      'confirmed': { text: 'Confirmed', color: 'info' },
      'preparing': { text: 'Preparing', color: 'primary' },
      'delivered': { text: 'Delivered', color: 'success' },
      'cancelled': { text: 'Cancelled', color: 'danger' }
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`badge bg-${s.color}`}>{s.text}</span>;
  };

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h3>Please login to view your orders</h3>
        <Link to="/login" className="btn btn-danger mt-3">Login</Link>
      </div>
    );
  }

  const userOrders = orders.filter(order => order.user_id === user.id);

  if (loading) {
    return <div className="text-center mt-5">Loading your orders...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">📋 My Orders</h1>
      
      {userOrders.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 text-center p-5">
          <div style={{ fontSize: '4rem' }}>🍽️</div>
          <h3>No orders yet</h3>
          <p className="text-muted">You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-danger">Start Shopping →</Link>
        </div>
      ) : (
        <div className="row">
          {userOrders.map((order) => (
            <div className="col-md-12 mb-4" key={order.id}>
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white border-0 pt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <small className="text-muted ms-2">{order.created_at}</small>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="card-body">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between mb-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total Paid:</strong>
                    <strong className="text-danger">₹{order.grand_total}</strong>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Payment: {order.payment_method}</small>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Delivery to: {order.delivery_address}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;