import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_KEY = 'habisave_currentUser';

export default function Pricing() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  const isPremium = localStorage.getItem(`habisave_premium_${currentUser?.id}`) === 'true';
  const userPlan = localStorage.getItem(`habisave_plan_${currentUser?.id}`); 
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Taskbar */}
      <nav className="fixed top-0 left-0 right-0 bg-teal-600 shadow px-6 h-16 flex items-center justify-end z-40">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-teal-700 transition"
          >
            <span className="text-white font-medium">Hello, {currentUser?.name}</span>
            <svg
              className="w-4 h-4 text-white"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
              <button
                onClick={() => navigate('/dashboard')}
                className="block w-full text-left px-4 py-2 text-sm text-teal-700 hover:bg-gray-100"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Header */}
      <div className="pt-24 px-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-teal-700">Pricing Plans</h1>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3 px-6 max-w-5xl mx-auto mt-8 pb-12">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Free Plan</h2>
          <p className="text-gray-600 mb-6">Basic goal tracking & manual contributions</p>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li>✔️ Unlimited goals</li>
            <li>✔️ Progress bars & badges</li>
          </ul>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400 transition"
          >
            Continue Free
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-teal-600">
          <h2 className="text-xl font-semibold mb-4">Premium Plan</h2>
          <p className="text-gray-600 mb-6">All Free features + group challenges & analytics</p>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li>✔️ Group saving challenges</li>
            <li>✔️ Advanced analytics & insights</li>
            <li>✔️ Custom themes</li>
            <li>✔️ Priority support</li>
            <li>✔️ No ads</li>
            <li>✔️ Early access to new features</li>
          </ul>
          <div className="text-3xl font-bold text-teal-700 mb-4">€0.99 / month</div>
          {isPremium? (
            <div className="w-full text-green-600 font-semibold flex items-center gap-2">
              ✅ Already Upgraded
            </div>
          ) : (
            <button
              onClick={() => navigate('/payment/premium')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition"
            >
              Upgrade Now
            </button>
          )}
        </div>

        {/* Lifetime Plan */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-teal-600">
          <h2 className="text-xl font-semibold mb-4">Lifetime Access</h2>
          <p className="text-gray-600 mb-6">One-time payment for all premium features forever</p>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li>✔️ Everything in Premium</li>
            <li>✔️ No recurring fees</li>
          </ul>
          <div className="text-3xl font-bold text-teal-700 mb-4">€49.99</div>
          {isPremium && userPlan === 'lifetime' ? (
            <div className="w-full text-green-600 font-semibold flex items-center gap-2">
              ✅ Lifetime Member
            </div>
          ) : (
            <button
              onClick={() => navigate('/payment/lifetime')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
