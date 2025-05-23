// src/components/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const SESSION_KEY = 'habisave_currentUser';

export default function Payment() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  const { plan } = useParams(); // "premium" or "lifetime"
  const planDetails = {
    premium: { label: 'Premium Plan', price: '€0.99 / month' },
    lifetime: { label: 'Lifetime Access', price: '€49.99' },
  }[plan] || {};

  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  const [form, setForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { name, number, expiry, cvv } = form;
    if (!name || !number || !expiry || !cvv) {
      setError('All fields are required.');
      return;
    }
    // TODO: integrate payment gateway
    alert(`Payment successful for ${planDetails.label}!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full max-w-md mb-8">
        <Link to="/pricing" className="text-teal-600 hover:underline">&larr; Back to Plans</Link>
        <h1 className="text-2xl font-bold text-teal-700 mt-4">{planDetails.label}</h1>
        <p className="text-gray-600">{planDetails.price}</p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              name="number"
              type="text"
              value={form.number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
              <input
                name="expiry"
                type="text"
                value={form.expiry}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="MM/YY"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                name="cvv"
                type="password"
                value={form.cvv}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="123"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}
