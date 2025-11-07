import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMsg, setCartMsg] = useState('');
  const [search, setSearch] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [wishlistMsg, setWishlistMsg] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minProductPrice, setMinProductPrice] = useState(0);
  const [maxProductPrice, setMaxProductPrice] = useState(10000);
  const { isLoggedIn, refreshCartCount, refreshWishlistCount } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
        setProducts(data);
        // Set slider min/max based on products
        if (data.length > 0) {
          const prices = data.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinProductPrice(min);
          setMaxProductPrice(max);
          setPriceRange([min, max]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isLoggedIn) return setWishlist([]);
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

  const handleAddToCart = async (product) => {
    setCartMsg('');
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
      setCartMsg('Added to cart!');
      refreshCartCount();
      setTimeout(() => setCartMsg(''), 1500);
    } catch (err) {
      setCartMsg(err.message);
      setTimeout(() => setCartMsg(''), 2000);
    }
  };

  const handleWishlistToggle = async (productId) => {
    setWishlistMsg('');
    const token = localStorage.getItem('token');
    const isInWishlist = wishlist.includes(productId);
    try {
      const url = `${import.meta.env.VITE_API_URL}/auth/wishlist`;
      const res = await fetch(url, {
        method: isInWishlist ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Wishlist error');
      setWishlistMsg(data.message);
      setWishlist((prev) =>
        isInWishlist ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      refreshWishlistCount();
      setTimeout(() => setWishlistMsg(''), 1500);
    } catch (err) {
      setWishlistMsg(err.message);
      setTimeout(() => setWishlistMsg(''), 2000);
    }
  };

  if (loading) return <div className="text-center mt-8 text-lg text-gray-500 animate-pulse">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 mt-8 font-semibold animate-pulse">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight drop-shadow">Our Products</h1>
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full max-w-md px-5 py-3 rounded-2xl shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg bg-white/80 placeholder-gray-400 transition"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="md:w-64 w-full md:sticky md:top-28 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white/90 rounded-2xl shadow p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-700">Filter by Price</h3>
              <div className="w-full flex justify-between text-sm text-gray-500 mb-1">
                <span>₹{priceRange[0]}</span>
                <span>Price</span>
                <span>₹{priceRange[1]}</span>
              </div>
              <Slider
                range
                min={minProductPrice}
                max={maxProductPrice}
                value={priceRange}
                onChange={setPriceRange}
                trackStyle={[{ backgroundColor: '#3b82f6' }]}
                handleStyle={[
                  { borderColor: '#3b82f6', backgroundColor: '#fff' },
                  { borderColor: '#3b82f6', backgroundColor: '#fff' }
                ]}
                railStyle={{ backgroundColor: '#dbeafe' }}
              />
              {/* Future filter options can go here */}
            </div>
          </aside>
          {/* Product Grid */}
          <div className="flex-1">
            {cartMsg && <div className="text-center mb-4 text-green-600 font-semibold animate-pulse">{cartMsg}</div>}
            {wishlistMsg && <div className="text-center mb-4 text-pink-600 font-semibold animate-pulse">{wishlistMsg}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products
                .filter(product => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    product.name?.toLowerCase().includes(q) ||
                    product.category?.toLowerCase().includes(q) ||
                    product.description?.toLowerCase().includes(q)
                  );
                })
                .filter(product => {
                  return product.price >= priceRange[0] && product.price <= priceRange[1];
                })
                .map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-3xl shadow-xl p-5 flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl border border-gray-100 group relative overflow-hidden"
                  >
                    {/* Floating wishlist heart */}
                    {isLoggedIn && (
                      <button
                        className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow hover:bg-pink-50 transition"
                        onClick={e => { e.preventDefault(); handleWishlistToggle(product._id); }}
                        aria-label={wishlist.includes(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        title={wishlist.includes(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {wishlist.includes(product._id) ? <FaHeart className="text-pink-500 text-xl" /> : <FaRegHeart className="text-gray-400 text-xl" />}
                      </button>
                    )}
                    {/* Product image with border/gradient */}
                    <div className="w-full h-40 flex items-center justify-center mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden border-2 border-blue-100 group-hover:border-blue-300 transition">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-contain h-36 w-full transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                    </div>
                    {/* Category badge */}
                    {product.category && <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{product.category}</div>}
                    <div className="font-bold text-lg mb-1 text-gray-800 text-center truncate w-full" title={product.name}>{product.name}</div>
                    {/* Star rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <FaStar key={i} className={i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({product.numReviews})</span>
                      </div>
                    )}
                    <div className="text-blue-600 font-semibold text-xl mb-2">₹{product.price}</div>
                    <div className="text-sm text-gray-500 mb-2 line-clamp-2 text-center">{product.description}</div>
                    <div className="text-xs text-gray-400 mb-2">Stock: <span className="font-medium text-gray-700">{product.countInStock}</span></div>
                    <div className="flex items-center gap-2 mt-2 w-full justify-center">
                      <Link
                        to={`/product/${product._id}`}
                        className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-blue-500 hover:to-purple-600 transition-all duration-200 text-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        View
                      </Link>
                      <button
                        onClick={e => { e.preventDefault(); handleAddToCart(product); }}
                        className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-all duration-200 text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList; 