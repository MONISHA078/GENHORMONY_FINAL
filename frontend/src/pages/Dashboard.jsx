import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEmotion } from '../context/EmotionContext';
import historyService from '../services/historyService';
import {
  Sparkles,
  Mic,
  Music,
  TrendingUp,
  Activity,
  Keyboard
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { currentEmotion } = useEmotion();
  const navigate = useNavigate();
  const [playHistory, setPlayHistory] = useState([]);

  // Load user's play history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await historyService.getPlayHistory();
        setPlayHistory(historyData);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, []);

  const emotionMetadata = {
    HAPPY: { label: 'Happy', emoji: '😊', confidence: '87%', color: 'text-amber-400' },
    SAD: { label: 'Sad', emoji: '😢', confidence: '92%', color: 'text-blue-400' },
    CALM: { label: 'Calm', emoji: '😌', confidence: '85%', color: 'text-emerald-400' },
    ANGRY: { label: 'Angry', emoji: '😡', confidence: '89%', color: 'text-red-400' },
    FEAR: { label: 'Fear', emoji: '😨', confidence: '81%', color: 'text-purple-400' }
  };

  const activeMoodInfo = emotionMetadata[currentEmotion] || {
    label: currentEmotion || 'Neutral',
    emoji: '😐',
    confidence: '80%',
    color: 'text-violet-400'
  };

  // Mock static history items matching screenshot
  const defaultHistoryItems = [
    { id: 'h1', title: 'Happy Vibes', source: 'Recommended for you', time: '2 min ago', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&q=80' },
    { id: 'h2', title: 'Lo-Fi Relax', source: 'AI Generated', time: '1 hour ago', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=80&q=80' },
    { id: 'h3', title: 'Chill Day', source: 'Recommended for you', time: 'Yesterday', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&q=80' }
  ];

  return (
    <div className="space-y-10">
      
      {/* Top Banner (Greeting + Current Mood) */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        
        {/* Welcome Greeting Card */}
        <div className="flex-1 bg-harmony-card/55 border border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3 z-10">
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, {user?.first_name || 'User'}! 👋
            </h1>
            <p className="text-sm text-harmony-muted font-medium">
              How are you feeling today?
            </p>
          </div>
          <div className="mt-8 z-10 flex items-center gap-2 text-xs font-semibold text-pink-400 tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            Empowered by Multimodal Emotion AI
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Current Mood Card */}
        <div className="w-full lg:w-[420px] bg-harmony-card/55 border border-white/5 rounded-3xl p-6 flex flex-row items-center justify-between relative overflow-hidden">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-harmony-muted tracking-wider block">
              Current Mood
            </span>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeMoodInfo.emoji}</span>
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${activeMoodInfo.color}`}>
                  {activeMoodInfo.label}
                </h3>
                <span className="text-xs text-harmony-muted font-semibold">
                  {activeMoodInfo.confidence} Confidence
                </span>
              </div>
            </div>
          </div>

          {/* Glowing Wavy Line Sparkline SVG */}
          <div className="w-40 h-20 relative flex items-center">
            <svg className="w-full h-full" viewBox="0 0 120 40">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#EC4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 5,30 C 20,25 30,5 45,20 C 60,35 70,10 85,25 C 100,40 110,15 115,5"
                fill="none"
                stroke="url(#sparklineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* Detect Emotion Grid Section */}
      <section className="space-y-6">
        {/* 3-Column Layout from Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Text Input */}
          <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between items-center text-center space-y-6 min-h-[220px] shadow-xl backdrop-blur-sm group hover:border-purple-500/20 transition-all duration-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:bg-purple-600/10 group-hover:border-purple-500/30 transition-all">
                <Keyboard className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">Text</h3>
              <p className="text-xs text-harmony-muted">
                Detect emotion from text
              </p>
            </div>

            <button
              onClick={() => navigate('/detect')}
              className="w-full py-2.5 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98]"
            >
              Use Text
            </button>
          </div>

          {/* Card 2: Speech Input */}
          <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between items-center text-center space-y-6 min-h-[220px] shadow-xl backdrop-blur-sm group hover:border-pink-500/20 transition-all duration-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:bg-pink-600/10 group-hover:border-pink-500/30 transition-all">
                <Mic className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">Speech</h3>
              <p className="text-xs text-harmony-muted">
                Detect emotion from your voice
              </p>
            </div>

            <button
              onClick={() => navigate('/detect')}
              className="w-full py-2.5 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98]"
            >
              Use Speech
            </button>
          </div>

          {/* Card 3: Face Input */}
          <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between items-center text-center space-y-6 min-h-[220px] shadow-xl backdrop-blur-sm group hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:bg-emerald-600/10 group-hover:border-emerald-500/30 transition-all">
                <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-white">Face</h3>
              <p className="text-xs text-harmony-muted">
                Detect emotion from your face
              </p>
            </div>

            <button
              onClick={() => navigate('/detect')}
              className="w-full py-2.5 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98]"
            >
              Use Face
            </button>
          </div>

        </div>
      </section>

      {/* Recent Activity & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-3 bg-harmony-card/55 border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="h-4.5 w-4.5 text-purple-400" />
              Recent Activity
            </h3>
          </div>

          <div className="divide-y divide-white/5 space-y-4">
            {playHistory && playHistory.length > 0 ? (
              playHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between pt-4 first:pt-0 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-900/20 border border-white/5 flex items-center justify-center text-purple-400 group-hover:border-purple-500/20 transition-all overflow-hidden">
                      <Music className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {item.song?.title || item.generated_music?.prompt || 'AI Audio Sequence'}
                      </h4>
                      <p className="text-[11px] text-harmony-muted mt-0.5">
                        {item.song ? 'Recommended for you' : 'AI Generated'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-harmony-muted">
                    {new Date(item.played_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              // Display mockup default items
              defaultHistoryItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between pt-4 first:pt-0 group">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-cover bg-center border border-white/5 flex-shrink-0" style={{ backgroundImage: `url(${item.img})` }}></div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-harmony-muted mt-0.5">
                        {item.source}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-harmony-muted font-medium">
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Top Emotions Pie Chart */}
        <div className="lg:col-span-2 bg-harmony-card/55 border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
            Top Emotions
          </h3>

          <div className="flex flex-row items-center justify-between gap-6">
            
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1c1a29" strokeWidth="5.5" />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#FBBF24"
                  strokeWidth="5.5"
                  strokeDasharray="45 55"
                  strokeDashoffset="0"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="5.5"
                  strokeDasharray="25 75"
                  strokeDashoffset="-45"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="5.5"
                  strokeDasharray="15 85"
                  strokeDashoffset="-70"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="5.5"
                  strokeDasharray="10 90"
                  strokeDashoffset="-85"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="5.5"
                  strokeDasharray="5 95"
                  strokeDashoffset="-95"
                />
              </svg>
              {/* Central text indicator */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs text-harmony-muted font-bold uppercase tracking-widest">Active</span>
                <span className="text-base font-extrabold text-white">{activeMoodInfo.label}</span>
              </div>
            </div>

            {/* Colors and Percentage Legend */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FBBF24]"></span>
                  Happy
                </div>
                <span className="text-harmony-muted font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
                  Relaxed
                </div>
                <span className="text-harmony-muted font-bold">25%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span>
                  Sad
                </div>
                <span className="text-harmony-muted font-bold">15%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]"></span>
                  Energetic
                </div>
                <span className="text-harmony-muted font-bold">10%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
                  Angry
                </div>
                <span className="text-harmony-muted font-bold">5%</span>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
};

export default Dashboard;
