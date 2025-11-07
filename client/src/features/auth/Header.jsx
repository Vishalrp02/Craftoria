import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const CraftoriaLogo = () => (
  <Link to="/" className="flex items-center gap-2 select-none">
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#60a5fa"/>
        </radialGradient>
        <linearGradient id="cartGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7"/>
          <stop offset="1" stopColor="#3b82f6"/>
        </linearGradient>
        <linearGradient id="handleGradient" x1="30" y1="20" x2="50" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399"/>
          <stop offset="1" stopColor="#60a5fa"/>
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#bgGradient)" stroke="#fff" strokeWidth="2"/>
      <path d="M20 60 Q40 50 60 60" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <rect x="25" y="35" width="30" height="18" rx="6" fill="url(#cartGradient)" stroke="#fff" strokeWidth="2"/>
      <circle cx="32" cy="56" r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="48" cy="56" r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
      <path d="M30 35 Q28 25 40 25 Q52 25 50 35" stroke="url(#handleGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <g>
        <circle cx="60" cy="22" r="2" fill="#34d399"/>
        <rect x="59" y="18" width="2" height="8" rx="1" fill="#34d399"/>
        <rect x="56" y="21" width="8" height="2" rx="1" fill="#34d399"/>
      </g>
    </svg>
    <span className="text-2xl font-extrabold tracking-widest bg-gradient-to-r from-green-400 via-blue-400 to-blue-600 bg-clip-text text-transparent select-none drop-shadow" style={{ fontFamily: 'Pacifico, cursive', letterSpacing: '0.12em' }}>Craftoria</span>
  </Link>
);

function getInitial(name, email) {
  if (name) return name[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return 'U';
}

const Header = () => {
  const { user, isLoggedIn, logout, cartCount, wishlistCount } = useAuth();
  const location = useLocation();
  const [dropdown, setDropdown] = useState(false);
  const avatarRef = useRef();
  const navigate = useNavigate();

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdown(false);
      }
    }
    if (dropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdown]);

  if (location.pathname.startsWith('/auth')) return null;
  return (
    <header className="w-full bg-white/80 shadow flex items-center justify-between px-6 py-3 fixed top-0 left-0 z-50 border-b border-gray-100 backdrop-blur">
      <CraftoriaLogo />
      <div className="flex items-center gap-6">
        {!isLoggedIn && (
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
          >
            Login
          </button>
        )}
        {isLoggedIn && (
          <button
            onClick={() => navigate('/cart')}
            className="relative group"
            aria-label="Cart"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500 group-hover:text-green-500 transition">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h6a1 1 0 011 1v7" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">{cartCount}</span>
            )}
          </button>
        )}
        {isLoggedIn && (
          <button
            className="relative mx-2 text-pink-500 hover:text-pink-600 text-2xl focus:outline-none"
            onClick={() => navigate('/wishlist')}
            aria-label="Wishlist"
            title="Wishlist"
          >
            <FaHeart />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
                {wishlistCount}
              </span>
            )}
          </button>
        )}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div
              ref={avatarRef}
              className="relative"
              onClick={() => setDropdown(v => !v)}
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow cursor-pointer border-2 border-white hover:scale-105 transition">
                {getInitial(user?.name, user?.email)}
              </div>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 text-gray-700 font-semibold border-b border-gray-100 mb-1">
                    {user?.name || user?.email || (user?.isAdmin ? 'Admin' : '')}
                  </div>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-xl transition"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-xl transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 