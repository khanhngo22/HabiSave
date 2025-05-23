// src/components/WelcomePage.jsx
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('habisave_currentUser'));

  // useEffect(() => {
  //   if (currentUser) {
  //     navigate('/dashboard', { replace: true });
  //   }
  // }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 to-teal-300 flex flex-col justify-center items-center text-center px-4 py-8">
      <h1 className="text-4xl font-bold text-teal-800 mb-4">Welcome to HabiSave</h1>
      <p className="text-lg text-teal-700 mb-8 max-w-md">
        Build better saving habits with simple, goal-based tracking. Let’s get started!
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link to={currentUser ? '/dashboard' : '/signup'}>
          <button className="bg-white hover:bg-teal-50 text-teal-600 border border-teal-600 font-semibold py-2 px-6 rounded-xl shadow transition">
            Sign Up
          </button>
        </Link>
        <Link to={currentUser ? '/dashboard' : '/login'}>
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-xl shadow transition">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
}
