import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);

  const steps = [
    { name: 'Order Confirmed', icon: '✅', time: 0 },
    { name: 'Preparing Food', icon: '👨‍🍳', time: 10 },
    { name: 'Out for Delivery', icon: '🚚', time: 25 },
    { name: 'Delivered', icon: '🏠', time: 40 }
  ];

  useEffect(() => {
    fetchOrder();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      const foundOrder = response.data.orders.find(o => o.id === parseInt(id));
      setOrder(foundOrder);
      
      const statusMap = {
        'pending': 0,
        'confirmed': 0,
        'preparing': 1,
        'delivered': 3
      };
      setCurrentStep(statusMap[foundOrder?.status] || 0);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  if (!order) {
    return <div className="text-center mt-5">Loading order details...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-danger text-white rounded-top-4">
          <h2 className="mb-0">🚚 Track Your Order</h2>
          <p>Order #{order.id}</p>
        </div>
        <div className="card-body p-4">
          
          <div className="text-center mb-4">
            <div className="alert alert-info">
              <h4>⏱️ Estimated Delivery in: <strong>{timeLeft} minutes</strong></h4>
              <p className="mb-0">Your food is on the way!</p>
            </div>
          </div>

          <div className="row mb-5">
            {steps.map((step, index) => (
              <div className="col-md-3 text-center" key={index}>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: index <= currentStep ? '#28a745' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    fontSize: '24px',
                    transition: 'all 0.3s'
                  }}
                >
                  {step.icon}
                </div>
                <h6>{step.name}</h6>
                <small className="text-muted">{step.time} min</small>
              </div>
            ))}
          </div>

          <div className="progress mb-4" style={{ height: '10px' }}>
            <div 
              className="progress-bar bg-success" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5>📋 Order Summary</h5>
              {order.items?.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between mb-2">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-danger">₹{order.grand_total}</strong>
              </div>
              <div className="mt-2">
                <small>Delivery to: {order.delivery_address}</small>
              </div>
              <Link to="/orders" className="btn btn-outline-danger btn-sm mt-3">
                ← Back to Orders
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderTracking;