import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import OutfitGenerator from './pages/OutfitGenerator';
import CalendarPage from './pages/CalendarPage';
import GapAnalysis from './pages/GapAnalysis';
import SharedOutfit from './pages/SharedOutfit';
import TripPacking from './pages/TripPacking';
import Profile from './pages/Profile';

// Protect routes that require authentication
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/add-item"     element={<PrivateRoute><AddItem /></PrivateRoute>} />
            <Route path="/generator"    element={<PrivateRoute><OutfitGenerator /></PrivateRoute>} />
            <Route path="/calendar"     element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
            <Route path="/gap-analysis" element={<PrivateRoute><GapAnalysis /></PrivateRoute>} />
            <Route path="/trip"         element={<PrivateRoute><TripPacking /></PrivateRoute>} />
            <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/share/:id"    element={<SharedOutfit />} />
            <Route path="/share"        element={<SharedOutfit />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
