import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white/90 rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold select-none">📝</span>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-gray-800 tracking-tight">Create Account</h2>
        <p className="text-gray-500 mb-6 text-center">Sign up to get started</p>
        {error && <div className="text-red-500 mb-2 w-full text-center font-medium animate-pulse">{error}</div>}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-xl font-semibold shadow-md hover:from-green-600 hover:to-blue-600 transition-all duration-200"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <a href="/auth" className="text-green-600 hover:underline font-medium">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 