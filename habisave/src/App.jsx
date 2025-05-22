import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import Dashboard   from './components/Dashboard';
import SignUp      from './components/SignUp';
import Login       from './components/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<WelcomePage />} />
        <Route path="/HabiSave"  element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />}   />
        <Route path="/signup"    element={<SignUp />}      />
        <Route path="/login"     element={<Login />}       />
      </Routes>
    </Router>
  );
}