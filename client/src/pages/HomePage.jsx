import React from 'react';
import ProductList from '../features/products/ProductList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import WishlistPage from './WishlistPage';

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  return (
    <div>
      <div className="flex justify-between items-center mt-8 mb-4 px-8">
        <h1 className="text-3xl font-bold">Products</h1>
        {/* Removed login button, now handled by header */}
      </div>
      <ProductList />
      {/* <button onClick={() => navigate('/admin')}>Move to admin Page</button> */}
    </div>
  );
};

export default HomePage; 