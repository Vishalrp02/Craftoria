import React, { useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', category: '', countInStock: '' });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      // Prepare product data
      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        category: form.category,
        countInStock: Number(form.countInStock),
      };
      // Never send _id on create
      if (!editId && productData._id) delete productData._id;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');
      setSuccess(editId ? 'Product updated!' : 'Product added!');
      setForm({ name: '', description: '', price: '', image: '', category: '', countInStock: '' });
      setEditId(null);
      setShowDialog(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = product => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      image: product.image || '',
      category: product.category || '',
      countInStock: product.countInStock || '',
    });
    setEditId(product._id);
    setShowDialog(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      setSuccess('Product deleted!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNew = () => {
    setForm({ name: '', description: '', price: '', image: '', category: '', countInStock: '' });
    setEditId(null);
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setForm({ name: '', description: '', price: '', image: '', category: '', countInStock: '' });
    setEditId(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-2xl border border-gray-200 p-8">
      <div className="flex w-full items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Products</h2>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          + Add New Product
        </button>
      </div>
      {error && <div className="text-red-500 mb-2 w-full text-center font-medium animate-pulse">{error}</div>}
      {success && <div className="text-green-500 mb-2 w-full text-center font-medium animate-pulse">{success}</div>}
      {loading ? (
        <div className="text-center text-lg text-gray-500 animate-pulse">Loading products...</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border rounded-xl overflow-hidden shadow-md bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                <th className="border p-2">Image</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="hover:bg-blue-50 transition">
                  <td className="border p-2">{product.image && product.image.startsWith('data:image') ? <img src={product.image} alt={product.name} className="h-12 object-contain rounded" /> : null}</td>
                  <td className="border p-2 font-semibold text-gray-800">{product.name}</td>
                  <td className="border p-2 text-blue-600 font-semibold">₹{product.price}</td>
                  <td className="border p-2">{product.countInStock}</td>
                  <td className="border p-2 text-xs text-gray-500">{product.category}</td>
                  <td className="border p-2 flex gap-2">
                    <button onClick={() => handleEdit(product)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition">Edit</button>
                    <button onClick={() => handleDelete(product._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add/Edit Product Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={handleDialogClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{editId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
              <input name="imageFile" type="file" accept="image/*" onChange={handleImageChange} className="p-3 border border-gray-300 rounded-xl" />
              <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              <input name="countInStock" value={form.countInStock} onChange={handleChange} placeholder="Stock" type="number" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              {form.image && (
                <img src={form.image} alt="Preview" className="h-24 object-contain border mx-auto rounded-xl" />
              )}
              <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 mt-2">{editId ? 'Update' : 'Add'} Product</button>
            </form>
            {error && <div className="text-red-500 mt-2 text-center font-medium animate-pulse">{error}</div>}
            {success && <div className="text-green-500 mt-2 text-center font-medium animate-pulse">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager; 