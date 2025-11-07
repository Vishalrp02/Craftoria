import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch cart count
  const refreshCartCount = async () => {
    if (!isLoggedIn) return setCartCount(0);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.cartItems) setCartCount(data.cartItems.length);
      else setCartCount(0);
    } catch {
      setCartCount(0);
    }
  };

  // Fetch wishlist count
  const refreshWishlistCount = async () => {
    if (!isLoggedIn) return setWishlistCount(0);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setWishlistCount((data.wishlist || []).length);
      else setWishlistCount(0);
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshCartCount();
      refreshWishlistCount();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isLoggedIn]);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    setIsLoggedIn(true);
    refreshCartCount();
    refreshWishlistCount();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setCartCount(0);
    setWishlistCount(0);
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, cartCount, wishlistCount, refreshCartCount, refreshWishlistCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 