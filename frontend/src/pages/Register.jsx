import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Music, Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setLocalError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    setLocalError('');
    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-harmony-bg px-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-950/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[450px] z-10">
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

          {success ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
              <p className="text-sm text-harmony-muted">
                Your account has been created. Redirecting to login page...
              </p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Join GenHarmony!
                </h2>
                <p className="text-sm text-harmony-muted">
                  Create an account to begin your musical journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {localError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-xs font-semibold text-harmony-muted tracking-wider">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#191724] border border-[#242235] focus:border-harmony-primary/50 rounded-xl text-white placeholder-harmony-muted/40 focus:outline-none transition-all text-sm"
                      placeholder="John"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-xs font-semibold text-harmony-muted tracking-wider">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#191724] border border-[#242235] focus:border-harmony-primary/50 rounded-xl text-white placeholder-harmony-muted/40 focus:outline-none transition-all text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-harmony-primary hover:bg-harmony-primary/95 text-white font-semibold transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              {/* Social Divider */}
              <div className="my-6 flex items-center justify-between text-[11px] uppercase tracking-wider text-harmony-muted/50">
                <span className="w-[30%] h-px bg-white/5"></span>
                <span>or continue with</span>
                <span className="w-[30%] h-px bg-white/5"></span>
              </div>

              {/* Social Sign-In Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#191724]/30 hover:bg-[#191724]/60 border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.97]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.114 2.78-1.42 3.66v3.04h2.28c5.44-5.01 5.44-12.44 5.2-8.55z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.01c-1.08.72-2.47 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.3v3.12C3.28 20.31 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.25 14.26c-.25-.72-.39-1.5-.39-2.26s.14-1.54.39-2.26V6.62H1.3a11.94 11.94 0 000 10.77l3.95-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.37 0 3.28 3.69 1.3 7.62l3.95 3.13c.95-2.85 3.61-5 6.75-5z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#191724]/30 hover:bg-[#191724]/60 border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.97]"
                >
                  <Mail className="h-4 w-4 text-harmony-muted" />
                  Email
                </button>
              </div>

              {/* Login Footer */}
              <div className="mt-8 text-center text-xs">
                <span className="text-harmony-muted">Already have an account? </span>
                <Link to="/login" className="font-semibold text-harmony-primary hover:text-purple-400 transition-colors">
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
