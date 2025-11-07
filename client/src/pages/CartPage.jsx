import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import Select from 'react-select';
import { countries, indianStates } from '../utils/addressData';

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 rounded-full p-6 mb-4 shadow-lg">
      <FaShoppingCart className="text-5xl text-blue-400" />
    </div>
    <div className="text-2xl font-bold text-gray-500 mb-2">Your cart is empty!</div>
    <div className="text-gray-400">Add some creative products to get started.</div>
  </div>
);

const CartPage = () => {
  const { isLoggedIn, refreshCartCount } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [productsMap, setProductsMap] = useState({});
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  });
  const [addressError, setAddressError] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions] = useState(countries);
  const [cityLoading, setCityLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const validateAddress = () => {
    const { name, address, city, state, zip, country, phone } = shippingAddress;
    if (!name || !address || !city || !state || !zip || !country || !phone) {
      setAddressError('Please fill in all shipping address fields.');
      return false;
    }
    setAddressError('');
    return true;
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // Handler for country select
  const handleCountrySelect = (selected) => {
    setShippingAddress(addr => ({ ...addr, country: selected ? selected.value : '', state: '', city: '' }));
    // If India, show all Indian states
    if (selected && selected.value === 'India') {
      setStateOptions(indianStates);
    } else {
      setStateOptions([]);
    }
    setCityOptions([]);
  };
  // Handler for state select
  const handleStateSelect = async (selected) => {
    setShippingAddress(addr => ({ ...addr, state: selected ? selected.value : '', city: '' }));
    setCityOptions([]);
    if (shippingAddress.country === 'India' && selected) {
      // Lazy load districts for the selected state
      try {
        const res = await fetch('/india-state-districts.json');
        const data = await res.json();
        const districts = data[selected.value] || [];
        setCityOptions(districts.map(city => ({ label: city, value: city })));
      } catch (err) {
        setCityOptions([]);
      }
    }
  };
  // Handler for city select
  const handleCitySelect = (selected) => {
    setShippingAddress(addr => ({ ...addr, city: selected ? selected.value : '' }));
  };
  // Handler for PIN code lookup (override progressive selection if valid PIN)
  const handlePinLookup = async (e) => {
    const zip = e.target.value;
    setShippingAddress({ ...shippingAddress, zip });
    setPinError('');
    if (/^\d{6}$/.test(zip)) {
      setCityLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffices = data[0].PostOffice;
          // Build city and state options from all post offices
          const cities = postOffices.map(po => ({ label: po.District, value: po.District }));
          const uniqueCities = Array.from(new Set(cities.map(c => c.value))).map(val => cities.find(c => c.value === val));
          setCityOptions(uniqueCities);
          const states = postOffices.map(po => ({ label: po.State, value: po.State }));
          const uniqueStates = Array.from(new Set(states.map(s => s.value))).map(val => states.find(s => s.value === val));
          setStateOptions(uniqueStates);
          // Auto-fill country as India
          setShippingAddress(addr => ({
            ...addr,
            city: postOffices[0].District,
            state: postOffices[0].State,
            country: 'India',
            zip,
          }));
        } else {
          setPinError('Invalid PIN code or not found.');
          setCityOptions([]);
          setStateOptions([]);
        }
      } catch (err) {
        setPinError('Failed to fetch address info.');
        setCityOptions([]);
        setStateOptions([]);
      } finally {
        setCityLoading(false);
      }
    } else {
      // If PIN is not valid, reset to progressive selection
      if (shippingAddress.country === 'India' && shippingAddress.state) {
        // Lazy load districts for the selected state
        try {
          const res = await fetch('/india-state-districts.json');
          const data = await res.json();
          const districts = data[shippingAddress.state] || [];
          setCityOptions(districts.map(city => ({ label: city, value: city })));
        } catch (err) {
          setCityOptions([]);
        }
      } else {
        setCityOptions([]);
      }
      if (shippingAddress.country === 'India') {
        setStateOptions(indianStates);
      } else {
        setStateOptions([]);
      }
    }
  };

  // Fetch all products and map by _id for easy lookup
  const fetchProductsMap = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
      const map = {};
      data.forEach(p => { map[p._id] = p; });
      setProductsMap(map);
    } catch (err) {
      setProductsMap({});
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
      setCart(data.cartItems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
      fetchProductsMap();
    }
  }, [isLoggedIn]);

  const handleRemove = async (productId) => {
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove item');
      setMsg('Item removed!');
      fetchCart();
      refreshCartCount();
      setTimeout(() => setMsg(''), 1500);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const handleQtyChange = async (productId, newQty, price) => {
    if (newQty < 1) return;
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: productId, qty: newQty, price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update quantity');
      setMsg('Cart updated!');
      fetchCart();
      refreshCartCount();
      setTimeout(() => setMsg(''), 1000);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  // Razorpay integration
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve();
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setPayError('');
    setPayLoading(true);
    try {
      if (!validateAddress()) {
        setPayLoading(false);
        return;
      }
      await loadRazorpayScript();
      const token = localStorage.getItem('token');
      // Create order on backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create order');
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        handler: async function (response) {
          try {
            // Prepare order data
            const orderItems = cart.map(item => ({
              product: item.product,
              qty: item.qty,
              price: item.price,
            }));
            const orderData = {
              orderItems,
              paymentMethod: 'Razorpay',
              totalPrice: total,
              paymentId: response.razorpay_payment_id,
              isPaid: true,
              shippingAddress, // include shipping address
            };
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(orderData),
            });
            const orderRes = await res.json();
            if (!res.ok) throw new Error(orderRes.message || 'Order creation failed');
            alert('Payment successful! Order placed. Order ID: ' + orderRes._id);
            // Clear cart on backend
            await fetch(`${import.meta.env.VITE_API_URL}/cart/clear`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
            setCart([]);
            localStorage.removeItem('cart');
            refreshCartCount();
            fetchCart();
            // Optionally redirect to order history or order details page
          } catch (err) {
            alert('Order creation failed: ' + err.message);
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#3399cc',
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (!isLoggedIn) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Please login to view your cart.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500 animate-pulse">Loading cart...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold animate-pulse">{error}</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 py-12 px-2 md:px-4">
      <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl border border-gray-200 p-4 md:p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-tight">Your Cart</h2>
        {msg && <div className="text-center mb-4 text-green-600 font-semibold animate-pulse">{msg}</div>}
        {payError && <div className="text-center mb-4 text-red-500 font-semibold animate-pulse">{payError}</div>}
        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border rounded-2xl overflow-hidden shadow bg-white mb-6">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="border p-3">Image</th>
                  <th className="border p-3">Product</th>
                  <th className="border p-3">Qty</th>
                  <th className="border p-3">Price</th>
                  <th className="border p-3">Total</th>
                  <th className="border p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => {
                  const product = productsMap[item.product] || {};
                  return (
                    <tr key={item.product} className={
                      `transition ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'} hover:bg-blue-100/60`
                    }>
                      <td className="border p-3 align-middle">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-16 w-16 object-cover rounded-full shadow border mx-auto" />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </td>
                      <td className="border p-3 align-middle">
                        <div className="font-bold text-gray-800 text-base md:text-lg">{product.name || item.product}</div>
                        {product.category && <div className="text-xs text-blue-400 font-semibold mb-1">{product.category}</div>}
                        <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">{product.description}</div>
                      </td>
                      <td className="border p-3 align-middle">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleQtyChange(item.product, item.qty - 1, item.price)}
                            className="bg-gray-200 px-3 py-1 rounded-full hover:bg-blue-200 text-lg font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >-</button>
                          <span className="px-2 text-base font-semibold">{item.qty}</span>
                          <button
                            onClick={() => handleQtyChange(item.product, item.qty + 1, item.price)}
                            className="bg-gray-200 px-3 py-1 rounded-full hover:bg-blue-200 text-lg font-bold shadow"
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                      </td>
                      <td className="border p-3 align-middle text-blue-600 font-semibold text-base">₹{item.price}</td>
                      <td className="border p-3 align-middle text-green-600 font-semibold text-base">₹{item.price * item.qty}</td>
                      <td className="border p-3 align-middle">
                        <button
                          onClick={() => handleRemove(item.product)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full shadow transition"
                          aria-label="Remove from cart"
                          title="Remove"
                        >
                          <FaTrashAlt className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {cart.length > 0 && (
          <>
            {/* Shipping Address Form */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-700">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={shippingAddress.name} onChange={handleAddressChange} placeholder="Full Name" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <input name="phone" value={shippingAddress.phone} onChange={handleAddressChange} placeholder="Phone" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <input name="address" value={shippingAddress.address} onChange={handleAddressChange} placeholder="Address" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition md:col-span-2" required />
                {/* Country dropdown */}
                <div>
                  <Select
                    name="country"
                    value={shippingAddress.country ? { label: shippingAddress.country, value: shippingAddress.country } : null}
                    onChange={handleCountrySelect}
                    options={countryOptions}
                    placeholder="Country"
                    classNamePrefix="react-select"
                    className="react-select-container"
                    required
                  />
                </div>
                {/* State dropdown */}
                <div>
                  <Select
                    name="state"
                    value={shippingAddress.state ? { label: shippingAddress.state, value: shippingAddress.state } : null}
                    onChange={handleStateSelect}
                    options={stateOptions}
                    isLoading={cityLoading}
                    isClearable
                    placeholder="State"
                    classNamePrefix="react-select"
                    className="react-select-container"
                    required
                  />
                </div>
                {/* City dropdown */}
                <div>
                  <Select
                    name="city"
                    value={shippingAddress.city ? { label: shippingAddress.city, value: shippingAddress.city } : null}
                    onChange={handleCitySelect}
                    options={cityOptions}
                    isLoading={cityLoading}
                    isClearable
                    placeholder="City"
                    classNamePrefix="react-select"
                    className="react-select-container"
                    required
                  />
                </div>
                {/* PIN/ZIP code triggers lookup */}
                <input name="zip" value={shippingAddress.zip} onChange={handlePinLookup} placeholder="PIN Code" className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required maxLength={6} />
              </div>
              {addressError && <div className="text-red-500 mt-2 text-center font-medium animate-pulse">{addressError}</div>}
              {pinError && <div className="text-red-500 mt-2 text-center font-medium animate-pulse">{pinError}</div>}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <div className="flex-1 flex items-center justify-center md:justify-start">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl px-6 py-4 shadow text-xl font-bold text-gray-800 border border-blue-200 flex items-center gap-2">
                  <FaShoppingCart className="text-blue-400 text-2xl mr-2" />
                  Total: <span className="ml-2 text-green-600">₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!validateAddress()) return;
                  handleCheckout();
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:from-green-500 hover:to-blue-600 transition-all duration-200 text-lg mt-4 md:mt-0 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={payLoading}
              >
                {payLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="text-xl" />
                    Proceed to Checkout
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage; 