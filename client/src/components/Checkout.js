import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '',
    landmark: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('Please login to checkout');
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      alert('Your cart is empty');
      navigate('/cart');
      return;
    }
    setCart(savedCart);
    
    const storedUser = JSON.parse(userData);
    if (storedUser.address) {
      setDeliveryAddress(prev => ({
        ...prev,
        street: storedUser.address
      }));
    }
  }, [navigate]);

  const getTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const deliveryFee = 40;
    const tax = subtotal * 0.05;
    return {
      subtotal,
      deliveryFee,
      tax,
      grandTotal: Math.round(subtotal + deliveryFee + tax)
    };
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value
    });
  };

  const placeOrder = async () => {
    if (!deliveryAddress.street) {
      alert('Please enter your delivery address');
      return;
    }
    
    setLoading(true);
    
    const totals = getTotal();
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.landmark}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipCode}`;
    
    const orderData = {
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      items: cart.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price
      })),
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      tax: Math.round(totals.tax),
      grand_total: totals.grandTotal,
      payment_method: 'cash_on_delivery',
      delivery_address: fullAddress,
      status: 'confirmed'
    };
    
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      if (response.data.success) {
        setOrderId(response.data.order.id);
        setOrderPlaced(true);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('orderPlaced'));
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = getTotal();

  if (orderPlaced) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0 rounded-4 text-center p-5">
              <div style={{ fontSize: '5rem' }}>🎉</div>
              <h1 className="text-success mt-3">Order Placed Successfully!</h1>
              <p className="lead">Thank you for your order, {user?.name}!</p>
              <div className="alert alert-info">
                <strong>Order ID: #{orderId}</strong>
              </div>
              <div className="alert alert-success">
                <h4>🚚 Estimated Delivery Time: <strong>30-40 minutes</strong></h4>
                <p className="mb-0">Your food is being prepared and will be delivered soon!</p>
              </div>
              <div className="alert alert-warning">
                <p>💵 Payment Method: Cash on Delivery</p>
                <small>Please keep exact cash ready for delivery</small>
              </div>
              <Link to="/orders" className="btn btn-danger btn-lg mt-3">
                View My Orders →
              </Link>
              <Link to="/" className="btn btn-outline-secondary btn-lg mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">🛒 Checkout</h1>
      
      <div className="row">
        <div className="col-md-7">
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-0 pt-4">
              <h4 className="mb-0">📦 Order Summary</h4>
            </div>
            <div className="card-body">
              {cart.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <h6 className="mb-0">{item.name}</h6>
                    <small className="text-muted">Quantity: {item.quantity || 1}</small>
                  </div>
                  <div className="text-end">
                    <span className="fw-bold">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4">
              <h4 className="mb-0">📍 Delivery Address</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Street Address *</label>
                <textarea 
                  name="street"
                  className="form-control"
                  rows="2"
                  placeholder="House/Flat No., Building Name, Street"
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Landmark</label>
                  <input 
                    type="text"
                    name="landmark"
                    className="form-control"
                    placeholder="Near school, hospital, etc."
                    value={deliveryAddress.landmark}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">City</label>
                  <input 
                    type="text"
                    name="city"
                    className="form-control"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">State</label>
                  <input 
                    type="text"
                    name="state"
                    className="form-control"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">PIN Code</label>
                  <input 
                    type="text"
                    name="zipCode"
                    className="form-control"
                    placeholder="400001"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white border-0 pt-4">
              <h4 className="mb-0">💰 Payment Summary</h4>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span>₹{totals.deliveryFee}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (5%):</span>
                <span>₹{Math.round(totals.tax)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Grand Total:</strong>
                <strong className="text-danger fs-5">₹{totals.grandTotal}</strong>
              </div>
              
              <div className="alert alert-success">
                <strong>💵 Payment Method: Cash on Delivery</strong><br/>
                <small>Pay when food is delivered</small>
              </div>
              
              <button 
                onClick={placeOrder}
                className="btn btn-danger w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order • ₹${totals.grandTotal} (Cash on Delivery)`}
              </button>
              
              <Link to="/cart" className="btn btn-outline-secondary w-100 mt-2">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;