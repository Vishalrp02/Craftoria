import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import PaymentPage from './features/payment/PaymentPage';
import AdminProductManager from './features/admin/AdminProductManager';
import { AuthProvider } from './features/auth/AuthContext';
import Header from './features/auth/Header';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/admin/products" element={<AdminProductManager />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
