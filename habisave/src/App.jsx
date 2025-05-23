import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import Dashboard   from './components/Dashboard';
import SignUp      from './components/SignUp';
import Login       from './components/Login';
import Pricing     from './components/Pricing';
import Payment     from './components/Payment';

export default function App() {
  const currentUser = JSON.parse(localStorage.getItem('habisave_currentUser'));
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<WelcomePage />} />
        <Route path="/HabiSave"  element={<WelcomePage />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard />}
        />
        <Route 
          path="/signup" 
          element={<SignUp />}
        />
        <Route 
          path="/login" 
          element={<Login />}
        />
        <Route
          path="/pricing"
          element={<Pricing />}
        />
        <Route
          path="/payment/:plan"
          element={<Payment />}
        />
      </Routes>
    </Router>
  );
}