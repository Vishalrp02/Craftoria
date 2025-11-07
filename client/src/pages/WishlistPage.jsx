import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const WishlistPage = () => {
  const { isLoggedIn, refreshCartCount, refreshWishlistCount } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setWishlist(data.wishlist || []);
        else setWishlist([]);
      } catch {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
        setProducts(data.filter(p => wishlist.includes(p._id)));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [wishlist]);

  const handleRemove = async (productId) => {
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setWishlist(wishlist.filter(id => id !== productId));
      setMsg('Removed from wishlist');
      refreshWishlistCount();
      setTimeout(() => setMsg(''), 1500);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const handleAddToCart = async (product) => {
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: product._id, qty: 1, price: product.price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
      setMsg('Added to cart!');
      refreshCartCount();
      setTimeout(() => setMsg(''), 1500);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  if (!isLoggedIn) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Please login to view your wishlist.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500 animate-pulse">Loading wishlist...</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-12 px-2 md:px-4">
      <div className="w-full max-w-7xl bg-white/90 rounded-3xl shadow-2xl border border-gray-200 p-4 md:p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-tight">Your Wishlist</h2>
        {msg && <div className="text-center mb-4 text-pink-600 font-semibold animate-pulse">{msg}</div>}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 rounded-full p-6 mb-4 shadow-lg">
              <FaHeart className="text-5xl text-pink-400" />
            </div>
            <div className="text-2xl font-bold text-gray-500 mb-2">Your wishlist is empty!</div>
            <div className="text-gray-400">Browse products and add your favorites.</div>
            <button onClick={() => navigate('/')} className="mt-6 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-all duration-200 text-lg">Go to Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl border border-gray-100 group relative overflow-hidden"
              >
                <button
                  className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow hover:bg-pink-50 transition"
                  onClick={() => handleRemove(product._id)}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                  style={{ zIndex: 20 }}
                >
                  <FaHeart className="text-pink-400 hover:text-pink-600 text-2xl" />
                </button>
                <div className="w-full h-40 flex items-center justify-center mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden z-10">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-contain h-36 w-full group-hover:scale-105 transition-transform duration-200"
                      style={{ zIndex: 10 }}
                    />
                  )}
                </div>
                <div className="font-bold text-base mb-1 text-gray-800 text-center truncate w-full" title={product.name}>{product.name}</div>
                <div className="text-blue-600 font-semibold text-xl mb-2">₹{product.price}</div>
                {product.category && <div className="text-xs text-gray-400 mb-2">{product.category}</div>}
                <div className="text-sm text-gray-500 mb-2 line-clamp-2 text-center">{product.description}</div>
                <div className="text-xs text-gray-400 mb-2">Stock: <span className="font-medium text-gray-700">{product.countInStock}</span></div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-all duration-200"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 