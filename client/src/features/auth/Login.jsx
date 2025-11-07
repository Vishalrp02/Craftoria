import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.token);
      setSuccess('Login successful!');
      setTimeout(() => {
        const decoded = jwtDecode(data.token);
        if (decoded.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white/90 rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center">
        <div className="w-24 h-24 mb-4 flex flex-col items-center justify-center">
          {/* Unique Craftoria SVG Logo */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            {/* Artistic brush stroke */}
            <path d="M20 60 Q40 50 60 60" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round"/>
            {/* Shopping cart body */}
            <rect x="25" y="35" width="30" height="18" rx="6" fill="url(#cartGradient)" stroke="#fff" strokeWidth="2"/>
            {/* Cart wheels */}
            <circle cx="32" cy="56" r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
            <circle cx="48" cy="56" r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
            {/* Cart handle (artistic) */}
            <path d="M30 35 Q28 25 40 25 Q52 25 50 35" stroke="url(#handleGradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* Sparkle for craft/art */}
            <g>
              <circle cx="60" cy="22" r="2" fill="#34d399"/>
              <rect x="59" y="18" width="2" height="8" rx="1" fill="#34d399"/>
              <rect x="56" y="21" width="8" height="2" rx="1" fill="#34d399"/>
            </g>
          </svg>
          <span className="mt-2 text-3xl font-extrabold tracking-widest bg-gradient-to-r from-green-400 via-blue-400 to-blue-600 bg-clip-text text-transparent select-none drop-shadow" style={{ fontFamily: 'Pacifico, cursive', letterSpacing: '0.12em' }}>Craftoria</span>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-gray-800 tracking-tight">Welcome Back!</h2>
        <p className="text-gray-500 mb-6 text-center">Sign in to continue your creative journey</p>
        {error && <div className="text-red-500 mb-2 w-full text-center font-medium animate-pulse">{error}</div>}
        {success && <div className="text-green-500 mb-2 w-full text-center font-medium animate-pulse">{success}</div>}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 rounded-xl font-semibold shadow-md hover:from-green-500 hover:to-blue-600 transition-all duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Don&apos;t have an account? <a href="/auth" className="text-blue-600 hover:underline font-medium">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 