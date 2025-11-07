import React, { useState } from 'react';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div>
        {isLogin ? <Login /> : <Register />}
        <div className="text-center mt-4">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button className="text-blue-600 underline" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button className="text-blue-600 underline" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 