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

  const [method, setMethod] = useState('');
  const [form, setForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [error, setError] = useState('');

  const handleFormChange = e => {
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
    if (currentUser) {
      localStorage.setItem(`habisave_premium_${currentUser.id}`, 'true');
      localStorage.setItem(`habisave_plan_${currentUser.id}`, plan);
    }

    alert(`Payment successful via ${method} for ${planDetails.label}!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full max-w-md mb-8 text-center">
        <h1 className="text-2xl font-bold text-teal-700">{planDetails.label}</h1>
        <p className="text-gray-600 mb-2">{planDetails.price}</p>
        <Link to="/pricing" className="text-teal-600 hover:underline">&larr; Back to Plans</Link>
      </header>

      {/* Payment Method Selection */}
      {!method && (
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md text-center space-y-4">
          <h2 className="text-lg font-semibold text-teal-700 mb-2">Choose Payment Method</h2>
          <button
            onClick={() => setMethod('Credit Card')}
            className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Pay with Credit Card
          </button>
          <button
            onClick={() => alert('Coming soon!')}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Pay with PayPal (Coming Soon)
          </button>
          <button
            onClick={() => alert('Coming soon!')}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Bank Transfer (Coming Soon)
          </button>
        </div>
      )}

      {/* Credit Card Form */}
      {method === 'Credit Card' && (
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md mt-6">
          <h2 className="text-lg font-semibold text-teal-700 mb-4">Pay with {method}</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Cardholder Name"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="text"
              name="number"
              value={form.number}
              onChange={handleFormChange}
              placeholder="Card Number"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <div className="flex gap-4">
              <input
                type="text"
                name="expiry"
                value={form.expiry}
                onChange={handleFormChange}
                placeholder="MM/YY"
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="password"
                name="cvv"
                value={form.cvv}
                onChange={handleFormChange}
                placeholder="CVV"
                className="w-24 border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setMethod(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                ← Previous
              </button>
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
              >
                Pay Now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
