import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';

const MyOrdersPage = () => {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/myorders`, {
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
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn]);

  if (!isLoggedIn) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Please login to view your orders.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500 animate-pulse">Loading orders...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold animate-pulse">{error}</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 py-12 px-2 md:px-4">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl border border-gray-200 p-4 md:p-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-tight">My Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border rounded-2xl overflow-hidden shadow bg-white mb-6">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="border p-3">Order ID</th>
                  <th className="border p-3">Date</th>
                  <th className="border p-3">Status</th>
                  <th className="border p-3">Total</th>
                  <th className="border p-3">Shipping</th>
                  <th className="border p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="transition hover:bg-blue-100/60">
                    <td className="border p-3 align-middle font-mono text-xs">{order._id}</td>
                    <td className="border p-3 align-middle">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                    <td className="border p-3 align-middle font-semibold text-blue-600">{order.isPaid ? 'Paid' : 'Pending'}</td>
                    <td className="border p-3 align-middle text-green-600 font-semibold">₹{order.totalPrice}</td>
                    <td className="border p-3 align-middle text-xs">
                      {order.shippingAddress ? (
                        <span>{order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}, {order.shippingAddress.country}, {order.shippingAddress.phone}</span>
                      ) : '-'}
                    </td>
                    <td className="border p-3 align-middle">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
                      >
                        View Details
                      </button>
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
              <div className="mb-2 text-sm text-gray-600"><b>Date:</b> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</div>
              <div className="mb-2 text-sm text-gray-600"><b>Status:</b> {selectedOrder.isPaid ? 'Paid' : 'Pending'}</div>
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
    </div>
  );
};

export default MyOrdersPage; 