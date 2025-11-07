import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import ReactImageMagnify from 'react-image-magnify';

const ProductReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setSuccess('Review submitted!');
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h4 className="font-bold mb-2">Write a Review</h4>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
      <div className="mb-2">
        <label className="block mb-1">Rating:</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded p-1">
          {[5,4,3,2,1].map(val => (
            <option key={val} value={val}>{val} - {['Excellent','Good','Average','Poor','Terrible'][5-val]}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Comment:</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="border rounded w-full p-2"
          rows={3}
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Review</button>
    </form>
  );
};

const ProductDetail = () => {
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [canReview, setCanReview] = useState(false);

  // Get productId from URL
  const productId = window.location.pathname.split('/').pop();

  useEffect(() => {
    // Fetch product details
    fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`)
      .then(res => res.json())
      .then(setProduct);

    // Fetch user orders (to check if user purchased this product)
    const token = localStorage.getItem('token');
    if (isLoggedIn) {
      fetch(`${import.meta.env.VITE_API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setOrders(data || []));
    }
  }, [productId, isLoggedIn]);

  useEffect(() => {
    // Check if user has purchased this product
    const purchased = orders.some(order =>
      order.isPaid &&
      order.orderItems.some(item => String(item.product) === String(productId))
    );
    setCanReview(purchased);
  }, [orders, productId]);

  const refreshProduct = () => {
    fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`)
      .then(res => res.json())
      .then(setProduct);
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-10 flex flex-col md:flex-row gap-10 items-start">
      {/* Product Image with Magnifier */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        {product.image ? (
          <div className="rounded-2xl overflow-hidden border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 p-2">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: product.name,
                  isFluidWidth: true,
                  src: product.image,
                },
                largeImage: {
                  src: product.image,
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerStyle: { zIndex: 20, background: 'white', borderRadius: '1rem' },
                enlargedImageStyle: { borderRadius: '1rem' },
                lensStyle: { backgroundColor: 'rgba(100,100,255,0.1)', border: '1px solid #60a5fa' },
                isHintEnabled: true,
                shouldUsePositiveSpaceLens: true,
              }}
            />
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-6xl">No Image</div>
        )}
      </div>
      {/* Product Info */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <h2 className="text-4xl font-extrabold mb-2 text-gray-800 tracking-tight drop-shadow">{product.name}</h2>
        <div className="mb-2 text-2xl text-blue-600 font-bold">₹{product.price}</div>
        <div className="mb-2 text-gray-500 text-lg">{product.description}</div>
        <div className="mb-2 text-lg">Average Rating: <span className="font-semibold">{product.rating?.toFixed(1) || 'N/A'}</span> <span className="text-gray-400">({product.numReviews} reviews)</span></div>
        <div className="mb-2 text-sm text-gray-400">Stock: <span className="font-medium text-gray-700">{product.countInStock}</span></div>
        <div className="mt-4">
          <h3 className="font-bold text-xl mb-2 text-gray-700">Reviews:</h3>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="max-h-48 overflow-y-auto pr-2">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="border-b py-2">
                  <div className="font-semibold text-blue-700">{review.name} <span className="text-yellow-500">★{review.rating}</span></div>
                  <div className="text-gray-600 text-xs">{new Date(review.createdAt).toLocaleString()}</div>
                  <div className="text-gray-700">{review.comment}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No reviews yet.</div>
          )}
        </div>
        {isLoggedIn && canReview && (
          <ProductReviewForm productId={productId} onReviewAdded={refreshProduct} />
        )}
        {isLoggedIn && !canReview && (
          <div className="text-gray-500 mt-4">You can only review this product after purchase.</div>
        )}
        {!isLoggedIn && (
          <div className="text-gray-500 mt-4">Please login to write a review.</div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 