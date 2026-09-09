import React, { useState, useEffect } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import feedbackService from '../../services/feedbackService';
import Visualizer from './Visualizer';
import { Play, Pause, Volume2, VolumeX, Disc, Sparkles, Star, X } from 'lucide-react';

export const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    isGenerated,
    currentTime,
    duration,
    volume,
    loading,
    error,
    togglePlay,
    seek,
    changeVolume,
    closeTrack
  } = usePlayback();

  const [rating, setRating] = useState(0);

  useEffect(() => {
    setRating(0);
  }, [currentTrack?.id]);

  const handleRate = async (stars) => {
    setRating(stars);
    try {
      const songId = isGenerated ? null : currentTrack.id;
      const genId = isGenerated ? currentTrack.id : null;
      await feedbackService.submitFeedback(songId, genId, stars);
    } catch (err) {
      console.error("Failed to submit rating feedback:", err);
    }
  };

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#13111C]/85 backdrop-blur-xl border-t border-white/5 py-4 px-6 shadow-2xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
      
      {/* Track info card */}
      <div className="flex items-center gap-3 min-w-0 md:w-1/4">
        {currentTrack.cover_url ? (
          <img 
            src={currentTrack.cover_url} 
            alt={currentTrack.title || 'Track Cover'} 
            className="w-12 h-12 rounded-xl object-cover shadow flex-shrink-0"
          />
        ) : (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr ${
            isGenerated ? 'from-purple-600 to-pink-500' : 'from-zinc-800 to-zinc-700'
          } text-white shadow`}>
            {isGenerated ? (
              <Sparkles className="h-5 w-5 text-pink-200 animate-pulse" />
            ) : (
              <Disc className="h-5 w-5 animate-spin" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {currentTrack.title || currentTrack.prompt}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-harmony-muted truncate">
              {isGenerated ? 'AI Generated' : currentTrack.artist}
            </span>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`h-3 w-3 cursor-pointer transition-colors ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600 hover:text-amber-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current pl-0.5" />
            )}
          </button>
        </div>

        {/* Progress Slider */}
        <div className="w-full flex items-center gap-3 text-xs text-harmony-muted font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-harmony-primary focus:outline-none"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {error && (
          <span className="text-[10px] text-red-400 font-semibold">{error}</span>
        )}
      </div>

      {/* Volume control & Visualizer */}
      <div className="flex items-center justify-end gap-6 md:w-1/4">
        {/* Equalizer frequency visualizer */}
        <Visualizer />

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeVolume(volume === 0 ? 0.8 : 0)}
            className="text-harmony-muted hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
        
        {/* Close Button */}
        <button
          onClick={closeTrack}
          className="p-1 rounded-full text-harmony-muted hover:bg-white/10 hover:text-white transition-all ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
