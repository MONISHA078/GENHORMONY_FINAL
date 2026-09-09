import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/hero_harmony.png';
import {
  Music,
  Smile,
  Cpu,
  Sparkles,
  Heart,
  ArrowRight,
  Menu,
  X,
  Play,
  Activity,
  User,
  LogOut,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Landing = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-harmony-bg text-harmony-text relative overflow-x-hidden font-sans">
      {/* Background glowing ambient grids/radial-gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-violet-800/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-harmony-bg/85 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-lg shadow-purple-500/25">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                GenHarmony
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-pink-400 font-bold block mt-1">
                Emotion AI Music
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-sm font-semibold text-harmony-text hover:text-pink-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-semibold text-harmony-muted hover:text-pink-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-semibold text-harmony-muted hover:text-pink-400 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-semibold text-harmony-muted hover:text-pink-400 transition-colors"
            >
              About
            </button>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-full border border-white/10 hover:bg-red-500/10 hover:text-red-400 text-harmony-muted transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-full text-sm font-bold border border-white/20 hover:border-white/40 hover:bg-white/5 text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-harmony-muted hover:text-white rounded-lg bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-20 bg-harmony-bg/95 border-b border-white/5 backdrop-blur-lg py-6 px-6 flex flex-col gap-6 shadow-2xl z-45">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left text-base font-semibold text-harmony-text hover:text-pink-400 py-1"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-base font-semibold text-harmony-muted hover:text-pink-400 py-1"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-base font-semibold text-harmony-muted hover:text-pink-400 py-1"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-base font-semibold text-harmony-muted hover:text-pink-400 py-1"
              >
                About
              </button>
            </nav>

            <div className="h-px bg-white/5"></div>

            <div className="flex flex-col gap-3">
              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full py-3 rounded-xl text-center text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Activity className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl text-center text-sm font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-3 rounded-xl text-center text-sm font-bold border border-white/10 text-white hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-3 rounded-xl text-center text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 md:py-32 flex flex-col md:flex-row items-center gap-12 z-10">
        <div className="flex-1 text-center md:text-left space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-pink-400 uppercase tracking-wider backdrop-blur-sm animate-pulse-slow">
            <Zap className="h-3.5 w-3.5" />
            Empowered by Advanced Emotion AI
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Feel the Emotion,<br />
            Hear the <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-purple-400 to-pink-500">Harmony</span>
          </h2>
          <p className="text-lg text-harmony-muted leading-relaxed">
            GenHarmony understands your emotions and recommends the perfect music or generates new melodies just for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-all flex items-center justify-center gap-2"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Graphic Visual */}
        <div className="flex-1 relative w-full max-w-md md:max-w-none flex justify-center">
          <div className="relative group">
            {/* Glowing aura around image */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-85 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
            
            <div className="relative rounded-3xl overflow-hidden bg-[#13111C] border border-white/10 shadow-2xl">
              <img
                src={heroImage}
                alt="GenHarmony Ambient Hero Graphic"
                className="w-full max-h-[460px] object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0F] via-transparent to-transparent opacity-80"></div>
              
              {/* Glassmorphic info label */}
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                  <Heart className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-medium text-harmony-muted">Currently Syncing</p>
                  <p className="text-sm font-extrabold text-white">Your Emotional State & Music Tempo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 bg-[#0e0c14] border-y border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              How It Works
            </h3>
            <p className="text-harmony-muted">
              Our end-to-end pipeline seamlessly translates your internal emotions into personalized, therapeutic soundtracks.
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-harmony-card/40 border border-white/5 rounded-2xl hover:border-violet-500/20 transition-all group">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-violet-600/10 group-hover:border-violet-500/30 transition-all relative">
                <Smile className="h-8 w-8 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet-600 text-white font-extrabold text-xs flex items-center justify-center">1</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">1. Detect Emotion</h4>
              <p className="text-sm text-harmony-muted leading-relaxed">
                Use text, speech, or facial expressions to detect your emotion.
              </p>
            </div>

            {/* Connection Arrow 1 */}
            <div className="hidden md:flex absolute top-12 left-[21%] w-[12%] h-[2px] items-center">
              <div className="w-full border-t-2 border-dashed border-white/10"></div>
              <div className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white/10 -ml-1"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-harmony-card/40 border border-white/5 rounded-2xl hover:border-pink-500/20 transition-all group">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-pink-600/10 group-hover:border-pink-500/30 transition-all relative">
                <Cpu className="h-8 w-8 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-600 text-white font-extrabold text-xs flex items-center justify-center">2</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">2. Analyze Emotion</h4>
              <p className="text-sm text-harmony-muted leading-relaxed">
                Our AI analyzes your emotion using advanced models.
              </p>
            </div>

            {/* Connection Arrow 2 */}
            <div className="hidden md:flex absolute top-12 left-[46%] w-[12%] h-[2px] items-center">
              <div className="w-full border-t-2 border-dashed border-white/10"></div>
              <div className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white/10 -ml-1"></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-harmony-card/40 border border-white/5 rounded-2xl hover:border-amber-500/20 transition-all group">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-amber-600/10 group-hover:border-amber-500/30 transition-all relative">
                <Music className="h-8 w-8 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">3</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">3. Get Music</h4>
              <p className="text-sm text-harmony-muted leading-relaxed">
                Receive recommended songs or generate new music.
              </p>
            </div>

            {/* Connection Arrow 3 */}
            <div className="hidden md:flex absolute top-12 left-[71%] w-[12%] h-[2px] items-center">
              <div className="w-full border-t-2 border-dashed border-white/10"></div>
              <div className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white/10 -ml-1"></div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-harmony-card/40 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-emerald-600/10 group-hover:border-emerald-500/30 transition-all relative">
                <Play className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">4</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">4. Feel Better</h4>
              <p className="text-sm text-harmony-muted leading-relaxed">
                Enjoy the music that matches your mood and feel better.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">Core Capabilities</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2 mb-4">
              Designed to Align Mind & Sound
            </h3>
            <p className="text-harmony-muted">
              GenHarmony couples state-of-the-art multimodal emotion mapping with dynamic playback configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                <Smile className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Multimodal Inputs</h4>
              <p className="text-harmony-muted text-sm leading-relaxed">
                Detect your mood using facial analysis, vocal tone, or written thoughts. Choose whatever input method makes you feel most comfortable.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Adaptive AI Fusion</h4>
              <p className="text-harmony-muted text-sm leading-relaxed">
                Our models fuse signals from different input modalities to output a precise valence and arousal emotion coordinate.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <Music className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Therapeutic Melodies</h4>
              <p className="text-harmony-muted text-sm leading-relaxed">
                Generate original synth lines and procedural beats tuned specifically to reduce stress, boost energy, or enhance your focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-[#0e0c14] border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-500">About the Project</span>
              <h3 className="text-3xl font-extrabold tracking-tight text-white">
                Empowering Mental Wellness Through Audio Intelligence
              </h3>
              <p className="text-harmony-muted leading-relaxed">
                GenHarmony was built on the intersection of deep neural networks and music therapy. Our core belief is that sound possesses a unique ability to heal, elevate, and regulate the nervous system. By analyzing facial markers, vocal patterns, and linguistic signals, we craft a sonic environment that responds to your emotional state in real-time.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">99% Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">AI Seed Melodies</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Vocal & Facial Models</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Premium UI Layout</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 bg-harmony-card border border-white/5 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none"></div>
              <h4 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 shrink-0" /> How is my emotion analyzed?
                  </h5>
                  <p className="text-xs text-harmony-muted mt-1 leading-relaxed pl-6">
                    We analyze your inputs locally on the client or server (using pre-trained models) to output an emotion signature. We do not store or distribute facial recordings or raw voice bytes.
                  </p>
                </div>
                <div className="h-px bg-white/5"></div>
                <div>
                  <h5 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 shrink-0" /> Can I use it on a mobile device?
                  </h5>
                  <p className="text-xs text-harmony-muted mt-1 leading-relaxed pl-6">
                    Yes! GenHarmony is fully responsive and supports standard camera and microphone integrations on mobile browsers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-harmony-bg border-t border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-harmony-muted text-sm">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5 text-pink-500" />
            <span className="font-extrabold text-white">GenHarmony</span>
          </div>
          <p>© {new Date().getFullYear()} GenHarmony. All rights reserved. Elevate your emotional wellbeing.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Back to top</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
