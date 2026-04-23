import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data.product);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center mt-5">Product not found!</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img src={product.imageUrl || '/images/default-food.jpg'} className="img-fluid rounded" alt={product.name} />
        </div>
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <h3 className="text-danger">₹{product.price}</h3>
          <button onClick={addToCart} className="btn btn-danger btn-lg mt-3">Add to Cart</button>
          <Link to="/" className="btn btn-secondary btn-lg mt-3 ms-2">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;