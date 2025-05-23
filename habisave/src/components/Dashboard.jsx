// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const SESSION_KEY = 'habisave_currentUser';
const getStorageKey = (userId) => `habisave_goals_${userId}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  const userKey = currentUser ? getStorageKey(currentUser.id) : null;

  const [goals, setGoals] = useState(() => {
    const stored = userKey && localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [celebration, setCelebration] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    localStorage.setItem(userKey, JSON.stringify(goals));
  }, [goals, userKey]);

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

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title || !target) return;
    const newGoal = {
      id: Date.now(),
      title,
      targetAmount: Number(target),
      currentAmount: 0,
      createdAt: Date.now(),
    };
    setGoals((prev) => [...prev, newGoal]);
    setTitle('');
    setTarget('');
  };

  const handleAddContribution = (id) => {
    const amount = parseFloat(prompt('Enter amount (€):'));
    if (!amount || amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, currentAmount: g.currentAmount + amount };
        if (g.currentAmount < g.targetAmount && updated.currentAmount >= g.targetAmount) {
          setCelebration({ title: g.title });
        }
        return updated;
      })
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this goal?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleEdit = (id) => {
    const newTitle = prompt('New title:');
    if (newTitle) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, title: newTitle } : g))
      );
    }
  };

  const renderBadges = (g) => {
    const pct = (g.currentAmount / g.targetAmount) * 100;
    const badges = [];
    if (g.currentAmount > 0) badges.push('🏅 First Save');
    if (pct >= 50 && pct < 100) badges.push('🎯 Halfway There');
    if (pct >= 100) badges.push('🏆 Goal Complete');
    return badges.map((b, i) => (
      <span key={i} className="text-sm mr-2">{b}</span>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden pt-16">
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
                onClick={() => navigate('/pricing')}
                className="block w-full text-left px-4 py-2 text-sm text-teal-700 hover:bg-gray-100"
              >
                Upgrade
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

      {/* Decorative blobs */}
      <div className="absolute top-0 -left-16 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" />

      {/* Celebration */}
      {celebration && (
        <>
          <Confetti recycle={false} numberOfPieces={200} />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs text-center">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">Congratulations!</h2>
              <p className="text-lg mb-6">You achieved your goal: <strong>{celebration.title}</strong></p>
              <button
                onClick={() => setCelebration(null)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-xl transition"
              >
                Awesome!
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="relative p-6">
        <form onSubmit={handleAddGoal} className="bg-white rounded-lg p-4 shadow mb-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-teal-600">Add a New Goal</h2>
          <input
            type="text"
            placeholder="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />
          <input
            type="number"
            placeholder="Target Amount (€)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />
          <button type="submit" className="w-full bg-teal-600 text-white font-semibold py-2 rounded hover:bg-teal-700 transition">
            Create Goal
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <div key={g.id} className="bg-white rounded-lg p-4 shadow relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button onClick={() => handleEdit(g.id)} title="Edit" className="text-gray-500 hover:text-teal-600">✏️</button>
                  <button onClick={() => handleDelete(g.id)} title="Delete" className="text-red-400 hover:text-red-600">🗑️</button>
                </div>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">{g.title}</h3>
                <div className="mb-2">{renderBadges(g)}</div>
                <div className="bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                  <div className="bg-teal-500 h-4 rounded-full transition-all" style={{ width: `${percent}%` }} />
                </div>
                <p className="text-sm text-gray-600 mb-3">€{g.currentAmount.toFixed(2)} / €{g.targetAmount.toFixed(2)}</p>
                <button className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition" onClick={() => handleAddContribution(g.id)}>
                  Add Contribution
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
