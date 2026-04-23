import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (cart.length === 0) {
    return (
      <div className="text-center mt-5">
        <h2>Your cart is empty 🛒</h2>
        <Link to="/" className="btn btn-primary mt-3">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Your Cart</h1>
      
      {cart.map((item) => (
        <div className="card mb-3" key={item.id}>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-5">
                <h5>{item.name}</h5>
                <p className="mb-0">₹{item.price} per item</p>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center gap-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >
                    -
                  </button>
                  <span className="mx-2 fw-bold">{item.quantity || 1}</span>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-md-2">
                <p className="fw-bold mb-0">₹{item.price * (item.quantity || 1)}</p>
              </div>
              <div className="col-md-2">
                <button onClick={() => removeItem(item.id)} className="btn btn-danger btn-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="card mt-3">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h4>Grand Total:</h4>
            <h4 className="text-danger">₹{getTotal()}</h4>
          </div>
          <Link to="/checkout" className="btn btn-success w-100 py-2 fw-bold">
            Proceed to Checkout →
          </Link>
          <Link to="/" className="btn btn-outline-secondary w-100 mt-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;