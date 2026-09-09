import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Music, Eye, EyeOff, Mail, AlertCircle, Loader, User, Shield, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [loginType, setLoginType] = useState(null); // null | 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectPortal = (type) => {
    setLoginType(type);
    setLocalError('');
    if (type === 'admin') {
      setEmail('admin@genharmony.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleBack = () => {
    setLoginType(null);
    setEmail('');
    setPassword('');
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setLocalError('');
    setIsSubmitting(true);
    try {
      const userProfile = await login(email, password);
      
      // Enforce admin privileges if admin portal is selected
      if (loginType === 'admin' && userProfile.role_name !== 'ADMIN') {
        throw new Error('You do not have administrative privileges.');
      }

      if (userProfile.role_name === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-harmony-bg px-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-950/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className={`w-full ${loginType === null ? 'max-w-[650px]' : 'max-w-[450px]'} transition-all duration-300 z-10`}>
        {/* Glassmorphic Card Container */}
        <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-md shadow-purple-500/10">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              GenHarmony
            </h1>
          </div>

          {loginType === null ? (
            /* SELECTION CARDS VIEW */
            <div className="space-y-8 animate-fadeIn">
              {/* Back Button to Landing */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-xs font-semibold text-harmony-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Landing
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Welcome to GenHarmony
                </h2>
                <p className="text-sm text-harmony-muted">
                  Please select your portal to continue
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Login Card */}
                <div
                  onClick={() => handleSelectPortal('user')}
                  className="bg-[#191724]/40 hover:bg-[#191724]/75 border border-white/5 hover:border-violet-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-4 group active:scale-[0.98]"
                >
                  <div className="p-4 rounded-full bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">User Portal</h3>
                    <p className="text-xs text-harmony-muted leading-relaxed">
                      Analyze emotional state, generate soundtracks, and get personalized recommendations.
                    </p>
                  </div>
                </div>

                {/* Admin Login Card */}
                <div
                  onClick={() => handleSelectPortal('admin')}
                  className="bg-[#191724]/40 hover:bg-[#191724]/75 border border-white/5 hover:border-pink-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-4 group active:scale-[0.98]"
                >
                  <div className="p-4 rounded-full bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Admin Portal</h3>
                    <p className="text-xs text-harmony-muted leading-relaxed">
                      Seed libraries, import bulk CSV song datasets, and manage audio metadata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FORM LOGIN VIEW */
            <div className="animate-fadeIn">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-xs font-semibold text-harmony-muted hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Selection
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  {loginType === 'admin' ? 'Admin Access' : 'User Access'}
                </h2>
                <p className="text-sm text-harmony-muted">
                  {loginType === 'admin' ? 'Log in with administrative credentials' : 'Log in to access your dashboard'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {localError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-harmony-muted tracking-wider">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#191724] border border-[#242235] focus:border-harmony-primary/50 rounded-xl text-white placeholder-harmony-muted/40 focus:outline-none transition-all text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold text-harmony-muted tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 bg-[#191724] border border-[#242235] focus:border-harmony-primary/50 rounded-xl text-white placeholder-harmony-muted/40 focus:outline-none transition-all text-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-harmony-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Registration Footer for Users */}
                {loginType === 'user' && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-harmony-muted font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-harmony-primary focus:ring-harmony-primary bg-[#191724] accent-harmony-primary"
                      />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="text-harmony-primary hover:text-purple-400 font-semibold transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-harmony-primary hover:bg-harmony-primary/95 text-white font-semibold transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Registration Footer (Only for User Portal) */}
              {loginType === 'user' && (
                <div className="mt-8 text-center text-xs">
                  <span className="text-harmony-muted">Don't have an account? </span>
                  <Link to="/register" className="font-semibold text-harmony-primary hover:text-purple-400 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
