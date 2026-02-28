import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Trophy, User, Camera } from 'lucide-react';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-sky-50 font-sans selection:bg-emerald-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />
      </Routes>

      {!isLoginPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto">
          <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/' ? 'text-emerald-500 scale-110' : 'text-slate-400'}`}>
            <HomeIcon size={24} strokeWidth={location.pathname === '/' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </Link>
          
          <div className="relative -top-8">
            <Link to="/" className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 border-4 border-white active:scale-90 transition-all">
              <Camera size={28} strokeWidth={3} />
            </Link>
          </div>

          <Link to="/leaderboard" className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/leaderboard' ? 'text-emerald-500 scale-110' : 'text-slate-400'}`}>
            <Trophy size={24} strokeWidth={location.pathname === '/leaderboard' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-widest">Ranks</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
