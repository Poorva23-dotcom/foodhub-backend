import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Food images mapping
  const getFoodImage = (productName) => {
    const imageMap = {
      'Vadapav': '/images/bg10.avif',
      'Ulta Vadapav': '/images/Ultavadapav.webp',
      'Batata Bhaji': '/images/Batatabhaji.jpg',
      'Kanda Bhaji': '/images/Kandabhaji.jpg',
      'Moong Bhaji': '/images/Moongbhaji.webp',
      'Palak Bhaji': '/images/Palakbhaji.jpg',
      'Methi Bhaji': '/images/Methibhaji.jpg',
      'Misal Pav': '/images/Misal.webp',
      'Fry Misal': '/images/Fry Misal.jpg',
      'Sev Usal': '/images/Sev usal.jpg',
      'Misal Thali': '/images/Misal.webp',
      'Bread Cutlet': '/images/Breadcutlet.jpg',
      'Punjabi Samosa': '/images/Punjabisamosa.avif',
      'Chinese Samosa': '/images/Chinesesamosa.jpg',
      'Kothimbir Vadi': '/images/Kothimbirvadi.jpg',
      'Kothimbir Vadi Chaat': '/images/Kothimbirvadichat.jpg',
      'Ukdiche Modak': '/images/Ukdichemodak.jpg',
      'Puranpoli': '/images/Puranpoli.webp'
    };
    
    if (imageMap[productName]) return imageMap[productName];
    
    for (let [key, value] of Object.entries(imageMap)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) return value;
    }
    return '/images/default-food.jpg';
  };

  // Function to get category based on product name
  const getProductCategory = (productName) => {
    if (productName.includes('Bhaji')) return 'Bhaji';
    if (productName.includes('Misal') || productName.includes('Sev Usal')) return 'Misal';
    if (productName.includes('Samosa') || productName.includes('Cutlet') || productName.includes('Vadi') || productName.includes('Vadapav')) return 'Snacks';
    if (productName.includes('Modak') || productName.includes('Puranpoli')) return 'Sweets';
    return 'Snacks';
  };

  const handleCategoryClick = (category) => {
    navigate('/all-products', { state: { category } });
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const productsWithImages = response.data.products.map(product => ({
        ...product,
        imageUrl: getFoodImage(product.name),
        category: getProductCategory(product.name)
      }));
      setProducts(productsWithImages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Refresh products to get updated stock
  const refreshProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const productsWithImages = response.data.products.map(product => ({
        ...product,
        imageUrl: getFoodImage(product.name),
        category: getProductCategory(product.name)
      }));
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Initial load and setup listeners
  useEffect(() => {
    fetchProducts();
    
    // Listen for storage events (when order is placed and cart is cleared)
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        refreshProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from checkout
    window.addEventListener('orderPlaced', refreshProducts);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderPlaced', refreshProducts);
    };
  }, []);

  const addToCart = (product) => {
    if (product.stock === 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }
    
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

  // Get category counts
  const getCategoryCount = (category) => {
    return products.filter(p => p.category === category).length;
  };

  // Get only 3 products for featured section
  const featuredProducts = products.slice(0, 3);

  // Filter featured products by search
  const filteredProducts = featuredProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading delicious food...</h4>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Animation */}
      <div className="hero-section text-white py-5 mb-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-md-6 animate-slide-in">
              <h1 className="display-4 fw-bold">Craving Something Delicious?</h1>
              <p className="lead mt-3">Order from the best restaurant in town. Fast delivery, authentic taste!</p>
              <div className="mt-4">
                <div className="input-group input-group-lg">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search for food..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-dark" type="button">
                    🔍 Search
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-center animate-float">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
                alt="Food Delivery" 
                style={{ width: '80%', maxWidth: '300px', animation: 'float 3s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categories Section */}
        <div className="mb-5">
          <h2 className="text-center mb-4">🍽️ Explore Categories</h2>
          <div className="row g-4">
            <div className="col-md-3 col-6">
              <div onClick={() => handleCategoryClick('Bhaji')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <div className="category-card text-center p-3 rounded shadow-sm">
                  <div style={{ fontSize: '3rem' }}>🥘</div>
                  <h6 className="mt-2 mb-0">Bhaji</h6>
                  <small className="text-muted">{getCategoryCount('Bhaji')} items</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div onClick={() => handleCategoryClick('Misal')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <div className="category-card text-center p-3 rounded shadow-sm">
                  <div style={{ fontSize: '3rem' }}>🍲</div>
                  <h6 className="mt-2 mb-0">Misal</h6>
                  <small className="text-muted">{getCategoryCount('Misal')} items</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div onClick={() => handleCategoryClick('Snacks')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <div className="category-card text-center p-3 rounded shadow-sm">
                  <div style={{ fontSize: '3rem' }}>🥟</div>
                  <h6 className="mt-2 mb-0">Snacks</h6>
                  <small className="text-muted">{getCategoryCount('Snacks')} items</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div onClick={() => handleCategoryClick('Sweets')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <div className="category-card text-center p-3 rounded shadow-sm">
                  <div style={{ fontSize: '3rem' }}>🍬</div>
                  <h6 className="mt-2 mb-0">Sweets</h6>
                  <small className="text-muted">{getCategoryCount('Sweets')} items</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Items Section - Only 3 Items */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>🔥 Featured Items</h2>
            <Link to="/all-products" className="btn btn-outline-danger rounded-pill">
              View All Menu → 
            </Link>
          </div>
          
          <div className="row g-4">
            {filteredProducts.map((product, index) => (
              <div className="col-md-4 col-sm-6" key={product.id}>
                <div className="card h-100 border-0 shadow-sm product-card" style={{ 
                  transition: 'all 0.3s', 
                  cursor: 'pointer', 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}>
                  <div className="position-relative overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      className="card-img-top food-image" 
                      alt={product.name}
                      style={{ 
                        height: '250px', 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/default-food.jpg';
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-danger rounded-pill">⭐ 4.5</span>
                    </div>
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="badge bg-warning position-absolute bottom-0 start-0 m-2 text-dark">
                        Only {product.stock} left!
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="badge bg-dark position-absolute bottom-0 start-0 m-2">
                        Out of Stock
                      </span>
                    )}
                    <div className="offer-badge">
                      <span className="badge bg-success">20% OFF</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{product.name}</h5>
                    <p className="text-muted small">✨ Premium Quality • Fresh • Hygienic</p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h4 text-danger fw-bold mb-0">₹{product.price}</span>
                      <del className="text-muted">₹{Math.round(product.price * 1.3)}</del>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        onClick={() => addToCart(product)} 
                        className="btn btn-danger flex-grow-1"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                      </button>
                      <Link to={`/product/${product.id}`} className="btn btn-outline-secondary">
                        👁️
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Special Banner */}
        <div className="row mb-5">
          <div className="col-md-12">
            <Link to="/all-products" style={{ textDecoration: 'none' }}>
              <div className="position-relative rounded-3 overflow-hidden daily-special" style={{ height: '280px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200" 
                  alt="Food Banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <div className="text-center text-white">
                    <h2 className="display-5 fw-bold animate-pulse">🍲 Daily Special: Misal Pav 🍲</h2>
                    <p className="lead">Get 20% OFF on First Order!</p>
                    <p>Use code: <span className="bg-warning text-dark p-2 rounded fw-bold">FOODHUB20</span></p>
                    <button className="btn btn-danger btn-lg mt-3">View All Items →</button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="feature-card text-center p-4 shadow-sm rounded">
              <div className="feature-icon">🚚</div>
              <h5 className="mt-3 fw-bold">Fast Delivery</h5>
              <p className="text-muted">Delivery within 30 minutes</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4 shadow-sm rounded">
              <div className="feature-icon">💰</div>
              <h5 className="mt-3 fw-bold">Best Prices</h5>
              <p className="text-muted">Great deals & offers daily</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4 shadow-sm rounded">
              <div className="feature-icon">⭐</div>
              <h5 className="mt-3 fw-bold">Quality Food</h5>
              <p className="text-muted">100% hygienic & authentic</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-slide-in {
          animation: slideIn 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
        
        .product-card:hover .food-image {
          transform: scale(1.1);
        }
        
        .category-card, .feature-card {
          transition: all 0.3s ease;
          background: white;
          cursor: pointer;
        }
        
        .category-card:hover, .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
          font-size: 3rem;
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.2);
        }
        
        .offer-badge {
          position: absolute;
          top: 10px;
          left: 10px;
        }
        
        .btn-outline-danger, .btn-danger {
          transition: all 0.3s ease;
        }
        
        .btn-outline-danger:hover, .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        }
        
        .daily-special {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        
        .daily-special:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default HomePage;