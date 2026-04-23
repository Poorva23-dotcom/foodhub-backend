import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    console.log('Logged in user:', parsedUser);
    
    if (parsedUser.role !== 'admin') {
      alert('Admin access only!');
      navigate('/');
      return;
    }
    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching data...');
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/api/users')
      ]);
      console.log('Products:', productsRes.data);
      console.log('Orders:', ordersRes.data);
      console.log('Users:', usersRes.data);
      
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + error.message);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      alert('Order status updated!');
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, productForm);
        alert('Product updated successfully!');
      } else {
        // Create new product
        await axios.post('http://localhost:5000/api/products', productForm);
        alert('Product added successfully!');
      }
      setEditingProduct(null);
      setShowAddForm(false);
      setProductForm({ name: '', price: '', stock: '', image: '' });
      fetchData();
      // Refresh homepage stock
      window.dispatchEvent(new Event('orderPlaced'));
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        alert('Product deleted successfully!');
        fetchData();
        window.dispatchEvent(new Event('orderPlaced'));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image || ''
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return `badge bg-${colors[status] || 'secondary'}`;
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="badge bg-dark">Out of Stock</span>;
    if (stock < 10) return <span className="badge bg-warning text-dark">Low Stock ({stock})</span>;
    return <span className="badge bg-success">In Stock ({stock})</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-danger text-white rounded-top-4">
          <h2 className="mb-0">👑 Admin Panel</h2>
          <p className="mb-0">Welcome, {user?.name}</p>
        </div>
        <div className="card-body p-4">
          
          {/* Tab Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'products' ? 'active text-danger fw-bold' : ''}`} 
                onClick={() => setActiveTab('products')}
              >
                🍕 Products ({products.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active text-danger fw-bold' : ''}`} 
                onClick={() => setActiveTab('orders')}
              >
                📦 Orders ({orders.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active text-danger fw-bold' : ''}`} 
                onClick={() => setActiveTab('users')}
              >
                👥 Users ({users.length})
              </button>
            </li>
          </ul>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <button className="btn btn-danger mb-3" onClick={() => { setShowAddForm(true); setEditingProduct(null); setProductForm({ name: '', price: '', stock: '', image: '' }); }}>
                + Add New Product
              </button>

              {/* Add/Edit Product Form */}
              {(showAddForm || editingProduct) && (
                <div className="card mb-4 border">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleProductSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Product Name *</label>
                          <input type="text" className="form-control" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Price (₹) *</label>
                          <input type="number" className="form-control" required value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Stock *</label>
                          <input type="number" className="form-control" required value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Image URL</label>
                          <input type="text" className="form-control" placeholder="/images/product-name.jpg" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-danger">{editingProduct ? 'Update' : 'Add'} Product</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingProduct(null); setShowAddForm(false); }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No products found</td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>
                            <img 
                              src={product.imageUrl || '/images/default-food.jpg'} 
                              alt={product.name} 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>₹{product.price}</td>
                          <td>{product.stock}</td>
                          <td>{getStockBadge(product.stock)}</td>
                          <td>
                            <button className="btn btn-sm btn-warning me-2" onClick={() => editProduct(product)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(product.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No orders found</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            {order.user_name}<br/>
                            <small className="text-muted">{order.user_email}</small>
                          </td>
                          <td>
                            {order.items?.map((item, idx) => (
                              <div key={idx}>{item.name} x {item.quantity}</div>
                            ))}
                          </td>
                          <td>₹{order.grand_total}</td>
                          <td>
                            <span className={getStatusBadge(order.status)}>{order.status}</span>
                          </td>
                          <td>
                            <select 
                              className="form-select form-select-sm" 
                              style={{ width: '120px' }} 
                              value={order.status} 
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || '-'}</td>
                          <td>
                            <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'info'}`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminPanel;