import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SESSION_KEY    = 'habisave_currentUser';
const USERS_KEY     = 'habisave_users';
const getStorageKey  = (userId) => `habisave_goals_${userId}`;
const getFriendsKey  = (userId) => `habisave_friends_${userId}`;
const getRequestsKey  = (userId) => `habisave_requests_${userId}`;

export default function Dashboard() {
  const navigate    = useNavigate();
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY));
  // **only** build keys once we know we have a user
  const userId      = currentUser?.id;
  const HISTORY_KEY = userId ? `habisave_history_${userId}` : null;
  const userKey     = userId ? getStorageKey(userId)            : null;
  const friendsKey  = userId ? getFriendsKey(userId)            : null;
  const requestsKey = userId ? getRequestsKey(userId)           : null;

  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  });
  const [goals, setGoals]         = useState(() => {
    const stored = userKey && localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [friends, setFriends]     = useState(() => {
    const stored = friendsKey && localStorage.getItem(friendsKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [requests, setRequests]   = useState(() => JSON.parse(localStorage.getItem(requestsKey) || '[]'));
  const [newFriend, setNewFriend] = useState('');
  const [title, setTitle]         = useState('');
  const [target, setTarget]       = useState('');
  const [shareWith, setShareWith] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef                   = useRef();

  // For development/demo purposes
  const [isPremium, setIsPremium] = useState(() => {
    const status = localStorage.getItem(`habisave_premium_${currentUser?.id}`);
    return status === 'true';
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  // Persist goals & friends
  useEffect(() => {
    localStorage.setItem(userKey, JSON.stringify(goals));
  }, [goals, userKey]);
  useEffect(() => {
    localStorage.setItem(friendsKey, JSON.stringify(friends));
  }, [friends, friendsKey]);
  useEffect(() => { localStorage.setItem(requestsKey, JSON.stringify(requests)); }, [requests, requestsKey]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persist history whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, HISTORY_KEY]);

  useEffect(() => {
    const interval = setInterval(() => {
      const storedGoals = JSON.parse(localStorage.getItem(userKey) || '[]');
      setGoals(prev => {
        const prevJson = JSON.stringify(prev);
        const storedJson = JSON.stringify(storedGoals);
        return prevJson !== storedJson ? storedGoals : prev;
      });
    }, 3000); // sync every 3 seconds

    return () => clearInterval(interval);
  }, [userKey]);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate('/', { replace: true });
  };

  // Goals
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title || !target) return;

    const newGoal = {
      id: Date.now(),
      title,
      targetAmount: Number(target),
      currentAmount: 0,
      createdAt: Date.now(),
      sharedWith: shareWith || null
    };

    // Save to current user
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);

    // Save to friend's list if shared
    if (isPremium && shareWith) {
      const friendKey = getStorageKey(shareWith.id);
      const friendGoals = JSON.parse(localStorage.getItem(friendKey) || '[]');

      const sharedCopy = {
        ...newGoal,
        sharedWith: { id: currentUser.id, name: currentUser.name }
      };

      localStorage.setItem(friendKey, JSON.stringify([...friendGoals, sharedCopy]));
    }

    // Reset form
    setTitle('');
    setTarget('');
    setShareWith(null);
  };

  const handleAddContribution = (id, quickAmount = null) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const amount = quickAmount ?? parseFloat(prompt('Enter amount (€):'));
    if (!amount || amount <= 0) return;

    const updatedGoals = goals.map(g => {
      if (g.id !== id) return g;
      const updated = { ...g, currentAmount: g.currentAmount + amount, lastUpdatedBy: currentUser.name };
      if (g.currentAmount < g.targetAmount && updated.currentAmount >= g.targetAmount) {
        setCelebration({ title: g.title });
      }
      return updated;
    });

    setGoals(updatedGoals);

    // If this is a shared goal, also update the friend's copy
    if (goal.sharedWith) {
      const friendKey = getStorageKey(goal.sharedWith.id);
      const friendGoals = JSON.parse(localStorage.getItem(friendKey) || '[]');
      const updatedFriendGoals = friendGoals.map(g =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount, lastUpdatedBy: currentUser.name } : g
      );
      localStorage.setItem(friendKey, JSON.stringify(updatedFriendGoals));
    }

    // History tracking (optional, already implemented elsewhere)
    const total = updatedGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    setHistory(prev => [
      ...prev,
      {
        date: new Date().toLocaleDateString(),
        goalName: goal.title,
        total: total
      }
    ]);
  };

  const handleDelete = (id) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;

    if (window.confirm('Delete this goal?')) {
      setGoals(prev => prev.filter(g => g.id !== id));

      // If shared and current user is the owner, also delete from friend's list
      if (goalToDelete.sharedWith && (!goalToDelete.sharedWith.id || goalToDelete.sharedWith.id !== currentUser.id)) {
        const friendKey = getStorageKey(goalToDelete.sharedWith.id);
        const friendGoals = JSON.parse(localStorage.getItem(friendKey) || '[]');
        const updatedFriendGoals = friendGoals.filter(g => g.id !== id);
        localStorage.setItem(friendKey, JSON.stringify(updatedFriendGoals));
      }
    }
  };

  const handleEdit = id => {
    const newTitle = prompt('New title:');
    if (newTitle) setGoals(prev => prev.map(g => g.id===id ? { ...g, title: newTitle } : g));
  };
  const renderBadges = g => {
    const pct = (g.currentAmount/g.targetAmount)*100;
    const badges = [];
    if (g.currentAmount>0)        badges.push('🏅 First Save');
    if(pct>=50 && pct<100)        badges.push('🎯 Halfway There');
    if(pct>=100)                  badges.push('🏆 Goal Complete');
    return badges.map((b,i)=><span key={i} className="text-sm mr-2">{b}</span>);
  };

  // Add friend: send request to target user
  const handleAddFriend = e => {
    e.preventDefault();
    const nameOrEmail = newFriend.trim();
    const target = users.find(u => u.name === nameOrEmail || u.email === nameOrEmail);
    if (!target) {
      alert('User not found');
      return;
    }
    if (target.id === currentUser.id) {
      alert('You cannot add yourself as a friend.');
      return;
    }
    // Prevent adding someone already a friend or with a pending request
    if (friends.some(f => f.id === target.id)) {
      alert(`${target.name} is already your friend.`);
      return;
    }
    const incomingKey = getRequestsKey(target.id);
    const incoming = JSON.parse(localStorage.getItem(incomingKey) || '[]');
    if (incoming.some(r => r.fromId === currentUser.id)) {
      alert(`Friend request to ${target.name} is already pending.`);
      return;
    }
    // Add to target's incoming requests
    incoming.push({ fromId: currentUser.id, fromName: currentUser.name });
    localStorage.setItem(incomingKey, JSON.stringify(incoming));
    setNewFriend('');
    alert('Friend request sent!');
  };

 // Remove friend and propagate change to the other user
  const handleRemoveFriend = id => {
    // 1. Remove from current user's list
    setFriends(prev => prev.filter(f => f.id !== id));

    // 2. Also remove current user from the other user's list
    const otherFriendsKey = getFriendsKey(id);
    const otherFriends = JSON.parse(localStorage.getItem(otherFriendsKey) || '[]');
    const updatedOther = otherFriends.filter(f => f.id !== currentUser.id);
    localStorage.setItem(otherFriendsKey, JSON.stringify(updatedOther));
  };

   // Utility to dedupe by id
  const dedupeById = arr =>
    arr.filter((item, idx, self) =>
      idx === self.findIndex(other => other.id === item.id)
    );
 
  // Accept request: update both users' friends and remove request
  const handleAccept = req => {
    // For current user, add and dedupe
    setFriends(prev =>
      dedupeById([
        ...prev,
        { id: req.fromId, name: req.fromName }
      ])
    );
    // For requester
    const reqUserFriendsKey = getFriendsKey(req.fromId);
    const reqUserFriends = JSON.parse(localStorage.getItem(reqUserFriendsKey) || '[]');
    reqUserFriends.push({ id: currentUser.id, name: currentUser.name });
    localStorage.setItem(reqUserFriendsKey, JSON.stringify(reqUserFriends));
    // Remove request
    setRequests(prev => prev.filter(r => r.fromId !== req.fromId));
  };
  const handleReject = fromId => {
    setRequests(prev => prev.filter(r => r.fromId !== fromId));
  };

  return (
    <div className="relative mt-16 p-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Taskbar */}
      <nav className="fixed top-0 left-0 right-0 bg-teal-600 shadow px-6 h-16 flex items-center justify-end z-40">

        <div className="flex items-center px-4 py-2 text-sm text-gray-800 space-x-2">
          <span>Premium (Toggle for developers):</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPremium}
              onChange={() => {
                const updated = !isPremium;
                setIsPremium(updated);
                localStorage.setItem(`habisave_premium_${currentUser?.id}`, updated);
              }}
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-teal-500 transition-all relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      {isPremium && (
        <div className="text-sm text-teal-700 font-medium mb-2">
          ✅ Premium Activated
        </div>
      )}

        <div className="relative" ref={menuRef}>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-teal-700 transition">
            <span className="text-white font-medium">Hello, {currentUser?.name}</span>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg overflow-hidden">
              <button onClick={()=>navigate('/pricing')} className="block w-full text-left px-4 py-2 text-sm text-teal-700 hover:bg-gray-100">Upgrade</button>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Log Out</button>
            </div>
          )}
        </div>
      </nav>

      {/* Decorative blobs */}
      <div className="absolute top-0 -left-16 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"/>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none"/>

      {/* Celebration */}
      {celebration && (
        <>
          <Confetti recycle={false} numberOfPieces={200}/>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs text-center">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">Congratulations!</h2>
              <p className="text-lg mb-6">You achieved: <strong>{celebration.title}</strong></p>
              <button onClick={()=>setCelebration(null)} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-xl">Awesome!</button>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 space-y-8">
        {/* Goals */}
        <form onSubmit={handleAddGoal} className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2 text-teal-600">Add a New Goal</h2>
          <p className="text-sm text-gray-500 mb-4">
            Manual tracking helps build discipline. Auto‑sync coming soon!
          </p>
          <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Goal Title"
            className="w-full border rounded px-3 py-2 mb-3"/>
          <input type="number" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target Amount (€)"
            className="w-full border rounded px-3 py-2 mb-3"/>
          {isPremium && friends.length > 0 && (
            <div className="mb-3">
              <label className="text-sm text-gray-700 block mb-1">Share with a friend (optional)</label>
              <select
                value={shareWith?.id || ''}
                onChange={(e) => {
                  const selected = friends.find(f => f.id === Number(e.target.value));
                  setShareWith(selected || null);
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Choose a friend (optional)</option>
                {friends.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition">Create Goal</button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {goals.map(g => {
            const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <div key={g.id} className={`rounded-lg p-4 shadow relative transition-all duration-300 ease-in-out ${
                                          g.sharedWith
                                            ? 'border-l-4 border-teal-400 bg-teal-50 animate-shared'
                                            : 'bg-white'
              }`}>
                {(!g.sharedWith || g.sharedWith.id !== currentUser.id) && (
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button onClick={() => handleEdit(g.id)} className="text-gray-500 hover:text-teal-600">✏️</button>
                    <button onClick={() => handleDelete(g.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-teal-800 mb-1">{g.sharedWith ? '🤝 ' : ''}{g.title}</h3>

                {/* Shared With Indicator */}
                {g.sharedWith && (
                  <p className="text-xs text-teal-600 mt-1">
                    🔗 Shared with <strong>{g.sharedWith.name}</strong>
                  </p>
                )}
                {g.lastUpdatedBy && g.sharedWith && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Last updated by <strong>{g.lastUpdatedBy}</strong> on {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                )}

                <div className="mb-1">{renderBadges(g)}</div>
                <div className="bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                  <div className="bg-teal-500 h-4 rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <p className="text-sm text-gray-600 mb-2">€{g.currentAmount.toFixed(2)} / €{g.targetAmount.toFixed(2)}</p>
                <button onClick={() => handleAddContribution(g.id)} className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition">Add Contribution</button>
                <p className="text-xs text-gray-500 mt-2">Tip: +€10 each week? Quick add:</p>
                <button onClick={() => handleAddContribution(g.id, 10)} className="text-xs text-teal-500 hover:underline">+ €10</button>
              </div>
            );
          })}
        </div>

        {/* Incoming Friend Requests */}
        {requests.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold text-teal-600 mb-2">Friend Requests</h2>
            <ul className="space-y-2">
              {requests.map(r => (
                <li key={r.fromId} className="flex justify-between items-center">
                  <span className="text-gray-800">{r.fromName}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAccept(r)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(r.fromId)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold text-teal-600 mb-2">Friends</h2>
          <form onSubmit={handleAddFriend} className="flex mb-4">
            <input
              value={newFriend}
              onChange={e => setNewFriend(e.target.value)}
              placeholder="Friend's name or email"
              className="flex-1 border rounded-l px-3 py-2"
            />
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 rounded-r hover:bg-teal-700 transition"
            >
              Add
            </button>
          </form>
          {friends.length === 0 ? (
            <p className="text-sm text-gray-500">No friends yet. Add someone and accept request!</p>
          ) : (
            <ul className="space-y-2">
              {friends.map(f => (
                <li key={f.id} className="flex justify-between items-center">
                  <span className="text-gray-800">{f.name}</span>
                  <button
                    onClick={() => handleRemoveFriend(f.id)}
                    className="text-sm text-red-600 hover:underline"
                  >       
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Right column: Insights & Analytics */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 text-yellow-900 px-6 py-5 rounded-xl shadow-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold mb-1">Go Premium & Save Smarter 🚀</h2>
            <p className="text-sm text-yellow-800">
              Get advanced insights, auto-sync, goal sharing, and more.
              <a href="/pricing" className="text-teal-600 hover:underline ml-1">Learn more</a>
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition"
          >
            Upgrade Now
          </button>
        </div>
      )}
      {isPremium && (
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* Insights & Analytics */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold text-teal-600 mb-2">Insights & Analytics</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Total Contribution Over Time
            </h3>
            <div classname="h-100">
              <Line
                data={{
                  labels: history.map(h => `${h.date} - ${h.goalName}`),
                  datasets: [{
                    label: 'Total Saved (€)',
                    data: history.map(h => h.total),
                    fill: false,
                    borderColor: 'teal',
                    tension: 0.4
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: { padding: { top: 20 } },
                  scales: {
                    x: {
                      title: { display: true, text: 'Date / Goal' }
                    },
                    y: {
                      title: { display: true, text: 'Total (€)' }
                    }
                  },
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Spending vs Saving (Coming Soon!)
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                  datasets: [
                    {
                      label: 'Income (€)',
                      data: [1000, 1200, 1100, 1300],
                      borderDash: [5, 5],
                      borderColor: 'gray',
                      tension: 0.4
                    },
                    {
                      label: 'Contributions (€)',
                      data: [200, 300, 250, 400],
                      borderColor: 'teal',
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: { padding: { top: 20 } },
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
