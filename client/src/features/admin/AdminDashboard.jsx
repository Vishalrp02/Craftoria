import React, { useState, useEffect } from 'react';
import AdminProductManager from './AdminProductManager';

const AdminOrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDelivered: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order');
      setSuccess('Order status updated!');
      setOrders(orders => orders.map(o => o._id === orderId ? { ...o, isDelivered: newStatus } : o));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/90 rounded-2xl shadow-2xl border border-gray-200 p-8">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">Manage Orders</h2>
      {error && <div className="text-red-500 mb-2 w-full text-center font-medium animate-pulse">{error}</div>}
      {success && <div className="text-green-500 mb-2 w-full text-center font-medium animate-pulse">{success}</div>}
      {loading ? (
        <div className="text-center text-lg text-gray-500 animate-pulse">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No orders found.</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border rounded-xl overflow-hidden shadow-md bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                <th className="border p-2">Order ID</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Shipping</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-blue-50 transition">
                  <td className="border p-2 font-mono text-xs">{order._id}</td>
                  <td className="border p-2 text-xs">{order.user || '-'}</td>
                  <td className="border p-2">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  <td className="border p-2 font-semibold text-blue-600">{order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}</td>
                  <td className="border p-2 text-green-600 font-semibold">₹{order.totalPrice}</td>
                  <td className="border p-2 text-xs">
                    {order.shippingAddress ? (
                      <span>{order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}, {order.shippingAddress.country}, {order.shippingAddress.phone}</span>
                    ) : '-'}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow transition"
                    >
                      View
                    </button>
                    {!order.isDelivered && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Order Details Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Order Details</h3>
            <div className="mb-2 text-sm text-gray-600"><b>Order ID:</b> {selectedOrder._id}</div>
            <div className="mb-2 text-sm text-gray-600"><b>User:</b> {selectedOrder.user || '-'}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Date:</b> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Status:</b> {selectedOrder.isDelivered ? 'Delivered' : selectedOrder.isPaid ? 'Paid' : 'Pending'}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Total:</b> ₹{selectedOrder.totalPrice}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Shipping:</b> {selectedOrder.shippingAddress ? (
              <span>{selectedOrder.shippingAddress.name}, {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}, {selectedOrder.shippingAddress.phone}</span>
            ) : '-'}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Items:</b></div>
            <ul className="mb-2 pl-4 list-disc text-gray-700">
              {selectedOrder.orderItems && selectedOrder.orderItems.map((item, idx) => (
                <li key={idx}>
                  {item.qty} x {item.product} @ ₹{item.price} each
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('products');

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 mt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r border-gray-200 flex flex-col py-10 px-4 gap-4 shadow-xl">
        {/* Removed admin icon and title for a cleaner look */}
        <button
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 mb-2 ${tab === 'products' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
          onClick={() => setTab('products')}
        >
          Manage Products
        </button>
        <button
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${tab === 'orders' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}
          onClick={() => setTab('orders')}
        >
          Manage Orders
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 flex flex-col items-center justify-start">
        {tab === 'products' && <AdminProductManager />}
        {tab === 'orders' && <AdminOrdersManager />}
      </main>
    </div>
  );
};

export default AdminDashboard; 