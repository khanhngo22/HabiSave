// src/components/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const USERS_KEY = 'habisave_users';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { name, email, password } = form;
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    // load existing users
    const existing = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // check for duplicate email
    if (existing.some(u => u.email === email)) {
      setError('Email already registered.');
      return;
    }

    // add new user
    const newUser = { id: Date.now(), name, email, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...existing, newUser]));
    // set current user session
    localStorage.setItem('habisave_currentUser', JSON.stringify(newUser));

    // clear and navigate
    setError('');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-300 to-teal-500 p-6">
      <div className="bg-white rounded-2xl p-8 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          Create an Account
        </h2>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
