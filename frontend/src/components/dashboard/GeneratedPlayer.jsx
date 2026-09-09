import React, { useState, useEffect } from 'react';
import { useEmotion } from '../../context/EmotionContext';
import { usePlayback } from '../../context/PlaybackContext';
import songService from '../../services/songService';
import api from '../../services/api';
import {
  Sparkles,
  Play,
  Pause,
  Loader,
  AlertTriangle,
  Heart,
  Download,
  ChevronDown,
  ChevronUp,
  Disc,
  Calendar,
  Music
} from 'lucide-react';

export const GeneratedPlayer = () => {
  const { currentEmotion } = useEmotion();
  const { playTrack, currentTrack, isPlaying, togglePlay, currentTime, duration: playbackDuration } = usePlayback();
  
  // States
  const [selectedEmotion, setSelectedEmotion] = useState(currentEmotion || 'HAPPY');
  const [duration, setDuration] = useState(15);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Advanced option states
  const [tempo, setTempo] = useState('MEDIUM');
  const [instrument, setInstrument] = useState('ALL');

  const currentTrackId = currentTrack?.id;
  const isCurrentTrackGenerated = currentTrack && currentTrack.file_path && currentTrack.file_path.includes('generated_music');

  // Sync selected emotion when currentEmotion updates in context
  useEffect(() => {
    if (currentEmotion) {
      setSelectedEmotion(currentEmotion);
    }
  }, [currentEmotion]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await songService.listGeneratedHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load generated music history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (generating) return;
    setGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const promptText = customPrompt.trim() || undefined;
      
      const newTrack = await songService.generateMusic(selectedEmotion, promptText, duration);
      const updatedHistory = [newTrack, ...history];
      
      // Immediately update local history state
      setHistory(updatedHistory);
      
      setSuccessMessage('Music track generated successfully! Click Play below to listen.');
      setCustomPrompt('');
      fetchHistory();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate AI music. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (track) => {
    if (!track) return;
    try {
      const url = `/songs/stream/generated/${track.id}`;
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${track.prompt.replace(/\s+/g, '_')}_generated.mp3`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download file', err);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === undefined) return '00:00';
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Determine active track showing in the player card
  // If active track is generated, use it. Otherwise fall back to the most recently generated track in history.
  const activeGeneratedTrack = isCurrentTrackGenerated 
    ? currentTrack 
    : (history && history.length > 0 ? history[0] : null);

  const displayDuration = isCurrentTrackGenerated && playbackDuration > 0 
    ? formatTime(playbackDuration) 
    : (activeGeneratedTrack?.duration ? formatTime(activeGeneratedTrack.duration) : formatTime(duration));

  return (
    <div className="space-y-8">
      {/* Generator Prompt Box matching screenshot */}
      <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-sm">
        
        {/* Emotion Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-harmony-muted uppercase tracking-wider block">
            Emotion
          </label>
          <div className="relative">
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full px-4 py-3 bg-[#191724] border border-[#242235] rounded-xl text-white text-xs font-semibold focus:outline-none transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_16px_center] bg-no-repeat pr-10"
            >
              <option value="HAPPY">😊 Happy</option>
              <option value="CALM">😌 Calm</option>
              <option value="SAD">😢 Sad</option>
              <option value="ANGRY">😡 Angry</option>
              <option value="NEUTRAL">😐 Neutral</option>
              <option value="SURPRISE">😲 Surprise</option>
              <option value="FEAR">😨 Fear</option>
            </select>
          </div>
        </div>

        {/* Custom Prompt field */}
        <div className="space-y-2 relative">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-harmony-muted uppercase tracking-wider">
              Describe the type of music (optional)
            </label>
          </div>
          <input
            type="text"
            maxLength={500}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={generating}
            className="w-full px-4 py-3 bg-[#191724] border border-[#242235] focus:border-harmony-primary/50 rounded-xl text-white placeholder-harmony-muted/40 focus:outline-none transition-all text-xs"
            placeholder="Example: Upbeat, acoustic, piano..."
          />
          <span className="absolute bottom-[-18px] right-1.5 text-[9px] font-mono text-harmony-muted/60">
            {customPrompt.length}/500
          </span>
        </div>

        {/* Duration Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-harmony-muted uppercase tracking-wider">
              Duration
            </label>
            <span className="text-xs font-bold text-white">{duration}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            disabled={generating}
            className="w-full h-1.5 bg-[#242235] rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[9px] text-harmony-muted/60 font-mono">
            <span>10s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Collapsible Advanced Options */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-harmony-muted hover:text-white transition-colors"
          >
            <span>Advanced Options</span>
            {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {advancedOpen && (
            <div className="p-4 bg-[#191724]/40 border border-[#242235] rounded-xl grid grid-cols-2 gap-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-harmony-muted">Tempo</label>
                <select
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  className="w-full bg-[#191724] border border-[#242235] rounded-lg p-2 text-xs text-white"
                >
                  <option value="SLOW">Slow (Ambient)</option>
                  <option value="MEDIUM">Medium (Vibey)</option>
                  <option value="FAST">Fast (Energetic)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-harmony-muted">Instruments</label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full bg-[#191724] border border-[#242235] rounded-lg p-2 text-xs text-white"
                >
                  <option value="ALL">All (Synth + Beat)</option>
                  <option value="PIANO">Melodic Piano</option>
                  <option value="AMBIENT">Pure Synth Pads</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit action button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 px-4 rounded-xl bg-harmony-primary hover:bg-harmony-primary/95 text-white font-bold text-xs transition-all shadow-lg shadow-purple-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader className="h-3.5 w-3.5 animate-spin" />
              Generating Music...
            </>
          ) : (
            'Generate Music'
          )}
        </button>

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Track Player Card matching screenshot */}
      {activeGeneratedTrack && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-harmony-muted uppercase tracking-wider block pl-1">
            Generated Track
          </span>
          
          <div className="bg-gradient-to-r from-purple-950/20 via-pink-950/15 to-violet-950/20 border border-purple-500/15 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
            
            {/* Play/Pause Button */}
            <button
              onClick={() => {
                if (isCurrentTrackGenerated) {
                  togglePlay();
                } else if (activeGeneratedTrack) {
                  playTrack(activeGeneratedTrack, true, history);
                }
              }}
              className="w-12 h-12 rounded-full bg-harmony-primary hover:bg-harmony-primary/90 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              {isPlaying && isCurrentTrackGenerated ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Waveform & Timeline */}
            <div className="flex-1 space-y-2">
              <div className="h-8 flex items-end justify-center gap-[3px] py-1">
                {/* Waveform vertical bars */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((bar) => {
                  const progressPct = (currentTime / (playbackDuration || activeGeneratedTrack?.duration || 15)) * 30;
                  const isActive = isCurrentTrackGenerated && progressPct >= bar;
                  const isNowPlaying = isCurrentTrackGenerated && isPlaying;
                  const baseHeight = (bar % 5 === 0 ? 20 : (bar % 3 === 0 ? 14 : (bar % 2 === 0 ? 10 : 24)));
                  const dynamicHeight = isNowPlaying && isActive ? Math.max(6, (baseHeight + (bar % 4) * 3) % 26) : baseHeight;
                  return (
                    <span
                      key={bar}
                      style={{ height: `${dynamicHeight}px` }}
                      className={`w-[2.5px] rounded-full transition-all duration-200 ${
                        isActive 
                          ? 'bg-purple-400 opacity-100 shadow-sm shadow-purple-500' 
                          : 'bg-white/30'
                      }`}
                    ></span>
                  );
                })}
              </div>
              
              {/* Timeline elapsed / duration */}
              <div className="flex justify-between text-[10px] text-harmony-muted font-mono font-semibold">
                <span>{isCurrentTrackGenerated ? formatTime(currentTime) : '00:00'}</span>
                <span>{displayDuration}</span>
              </div>
            </div>

            {/* Actions: Download & Favoriting */}
            <div className="flex items-center gap-4 text-harmony-muted flex-shrink-0">
              <button
                onClick={() => handleDownload(activeGeneratedTrack)}
                className="p-2.5 rounded-full hover:bg-white/5 hover:text-white transition-all"
                title="Download Track"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="p-2.5 rounded-full hover:bg-white/5 transition-all"
                title="Save to favorites"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorited ? 'text-pink-500 fill-pink-500' : 'hover:text-white'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Generated History Index */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-harmony-muted uppercase tracking-wider">All Generated Tracks</h3>
        
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader className="h-5 w-5 text-harmony-primary animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-harmony-muted text-xs border border-dashed border-white/5 rounded-2xl bg-harmony-card/20">
            No generated tracks found. Trigger your first AI generation above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {history.map((track) => {
              const isPlayingTrack = currentTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, true, history)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isPlayingTrack
                      ? 'border-harmony-primary bg-harmony-primary/10 shadow-lg shadow-purple-500/5'
                      : 'border-white/5 bg-[#1B1926]/30 hover:bg-[#1B1926]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isPlayingTrack ? 'bg-harmony-primary text-white' : 'bg-white/5 text-harmony-muted group-hover:bg-harmony-primary/10'
                    }`}>
                      {isPlayingTrack && isPlaying ? <Disc className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isPlayingTrack ? 'text-white font-extrabold' : 'text-white/80'}`}>
                        {track.prompt}
                      </p>
                      <p className="text-[9px] text-harmony-muted flex items-center gap-1.5 mt-1 font-medium">
                        <Calendar className="h-3 w-3" />
                        {formatDate(track.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold ${
                    track.emotion_tag === 'HAPPY' ? 'bg-amber-500/10 text-amber-400' :
                    track.emotion_tag === 'SAD' ? 'bg-blue-500/10 text-blue-400' :
                    track.emotion_tag === 'CALM' ? 'bg-emerald-500/10 text-emerald-400' :
                    track.emotion_tag === 'ANGRY' ? 'bg-red-500/10 text-red-400' :
                    track.emotion_tag === 'NEUTRAL' ? 'bg-gray-500/10 text-gray-400' :
                    track.emotion_tag === 'SURPRISE' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {track.emotion_tag}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedPlayer;
