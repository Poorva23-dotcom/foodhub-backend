import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './components/HomePage';
import AllProducts from './components/AllProducts';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Checkout from './components/Checkout';
import Orders from './components/Order';
import AdminPanel from './components/AdminPanel';
import OrderTracking from './components/OrderTracking';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/track-order/:id" element={<OrderTracking />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;