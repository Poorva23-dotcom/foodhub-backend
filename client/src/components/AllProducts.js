import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const location = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [showFilters, setShowFilters] = useState(false);

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

  const getProductCategory = (productName) => {
    if (productName.includes('Bhaji')) return 'Bhaji';
    if (productName.includes('Misal') || productName.includes('Sev Usal')) return 'Misal';
    if (productName.includes('Samosa') || productName.includes('Cutlet') || productName.includes('Vadi') || productName.includes('Vadapav')) return 'Snacks';
    if (productName.includes('Modak') || productName.includes('Puranpoli')) return 'Sweets';
    return 'Snacks';
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location]);

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

  const addToCart = (product) => {
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const filtered = products
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (productName) => {
    setSearchTerm(productName);
    setShowSuggestions(false);
  };

  // Apply all filters and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Apply sorting
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  const getCategoryCount = (category) => {
    if (category === 'all') return products.length;
    return products.filter(p => p.category === category).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading delicious food...</h4>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-danger text-white py-4 mb-4" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0 0 20px 20px'
      }}>
        <div className="container">
          <h1 className="display-5 fw-bold">🍽️ Our Complete Menu</h1>
          <p className="lead">Discover all our delicious items</p>
        </div>
      </div>

      <div className="container">
        {/* Category Filter Buttons */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <button 
                className={`btn ${selectedCategory === 'all' ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={() => setSelectedCategory('all')}
              >
                All ({getCategoryCount('all')})
              </button>
              <button 
                className={`btn ${selectedCategory === 'Bhaji' ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={() => setSelectedCategory('Bhaji')}
              >
                🥘 Bhaji ({getCategoryCount('Bhaji')})
              </button>
              <button 
                className={`btn ${selectedCategory === 'Misal' ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={() => setSelectedCategory('Misal')}
              >
                🍲 Misal ({getCategoryCount('Misal')})
              </button>
              <button 
                className={`btn ${selectedCategory === 'Snacks' ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={() => setSelectedCategory('Snacks')}
              >
                🥟 Snacks ({getCategoryCount('Snacks')})
              </button>
              <button 
                className={`btn ${selectedCategory === 'Sweets' ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4`}
                onClick={() => setSelectedCategory('Sweets')}
              >
                🍬 Sweets ({getCategoryCount('Sweets')})
              </button>
            </div>
          </div>
        </div>

        {/* Sort and Filter Bar */}
        <div className="row mb-4">
          <div className="col-md-12">
            <button 
              className="btn btn-outline-danger mb-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Sort by</label>
              <select 
                className="form-select" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Price Range</label>
              <div className="d-flex gap-2">
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Min" 
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                />
                <span>-</span>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Max" 
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar with Autocomplete */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="🔍 Search for food..." 
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {suggestions.map((product, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectSuggestion(product.name)}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid #eee' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      🔍 {product.name} - ₹{product.price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-3">
          <p className="text-muted">Found {filteredProducts.length} items</p>
        </div>

        {/* Products Grid */}
        <div className="row g-4 mb-5">
          {filteredProducts.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div style={{ fontSize: '4rem' }}>😢</div>
              <h4>No items found</h4>
              <p className="text-muted">Try a different search or category</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div className="col-md-3 col-sm-6" key={product.id}>
                <div className="card h-100 border-0 shadow-sm product-card" style={{ transition: 'transform 0.3s', borderRadius: '15px', overflow: 'hidden' }}>
                  <img 
                    src={product.imageUrl} 
                    className="card-img-top" 
                    alt={product.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/images/default-food.jpg';
                    }}
                  />
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{product.name}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="h5 text-danger fw-bold">₹{product.price}</span>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="btn btn-danger btn-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back to Home Button */}
        <div className="text-center mb-5">
          <Link to="/" className="btn btn-outline-danger btn-lg rounded-pill">
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .btn-outline-danger:hover, .btn-danger {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default AllProducts;