import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MusicPlayer from '../components/audio/MusicPlayer';
import { usePlayback } from '../context/PlaybackContext';
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Music,
  Shield,
  History,
  Info,
  Smile,
  Sparkles,
  Play,
  Settings,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';
import FeedbackModal from '../components/common/FeedbackModal';

export const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { currentTrack, isPlaying } = usePlayback();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Theme Toggle Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Detect Emotion', href: '/detect', icon: Smile },
    { name: 'Recommended Music', href: '/recommended-music', icon: Music },
    { name: 'Generate Music', href: '/generate-music', icon: Sparkles },
    { name: 'Music Player', href: '/music-player', icon: Play },
    { name: 'History', href: '/history', icon: History },
    { name: 'Feedback', href: '#', icon: MessageSquare, isModal: true },
    { name: 'Settings', href: '/profile', icon: Settings },
  ];

  const handleNavClick = (item, e) => {
    if (item.isModal) {
      e.preventDefault();
      setIsFeedbackModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-harmony-bg text-harmony-text flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop - Fixed Full Height */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#13111C] border-r border-white/5 p-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-md">
            <Music className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              GenHarmony
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-pink-400 font-bold">
              Emotion AI Music
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            if (item.isModal) {
              return (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(item, e)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs text-harmony-muted hover:bg-white/5 hover:text-white text-left"
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.name}
                </button>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs ${
                  isActive
                    ? 'bg-harmony-primary text-white shadow-lg shadow-purple-500/10'
                    : 'text-harmony-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs text-pink-400 hover:bg-pink-500/10`}
            >
              <Shield className="h-4.5 w-4.5" />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* User Card */}
        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-inner uppercase text-sm">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-harmony-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-xs"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#13111C] border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-harmony-primary animate-pulse" />
          <span className="font-extrabold text-white">GenHarmony</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-harmony-muted hover:text-white rounded-lg bg-white/5"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-harmony-bg/95 backdrop-blur-md flex flex-col p-6 pt-24 space-y-6">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              if (item.isModal) {
                return (
                  <button
                    key={item.name}
                    onClick={(e) => handleNavClick(item, e)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-harmony-muted text-left"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </button>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    isActive ? 'bg-harmony-primary text-white' : 'text-harmony-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-pink-400"
              >
                <Shield className="h-5 w-5" />
                Admin Dashboard
              </Link>
            )}
          </nav>
          <div className="pt-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content & Shared Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header for Search & Profile */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-[#0B0A0F] border-b border-white/5">
          {/* Search bar */}
          <div className="w-96">
            <input
              type="text"
              placeholder="Search music, mood, artist..."
              className="w-full px-4 py-2.5 bg-[#13111C] border border-white/5 rounded-xl text-xs text-white placeholder-harmony-muted/50 focus:outline-none focus:border-harmony-primary/30 transition-all"
            />
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-harmony-muted hover:text-white transition-colors rounded-xl bg-white/5 border border-white/5 flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>
            
            <button className="relative text-harmony-muted hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-pink-500"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-inner uppercase text-sm">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-90">
                  <span className="text-sm font-semibold text-white">
                    {user?.first_name || 'User'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-harmony-muted" />
                </div>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                  Premium
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full z-0 pb-28">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Player */}
      {currentTrack && <MusicPlayer />}

      {/* Feedback Collection Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
