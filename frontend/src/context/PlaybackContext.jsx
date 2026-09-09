import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import api from '../services/api';
import historyService from '../services/historyService';

const PlaybackContext = createContext(null);

export const PlaybackProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Initialize persistent HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const [playlist, setPlaylist] = useState([]);

  // Autoplay next song from playlist when current song ends
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      if (playlist.length > 0 && currentTrack) {
        const index = playlist.findIndex((t) => t.id === currentTrack.id);
        if (index !== -1 && index + 1 < playlist.length) {
          const nextTrack = playlist[index + 1];
          playTrack(nextTrack, isGenerated, playlist);
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentTrack, isGenerated]);

  // Update volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = async (track, generated = false, newPlaylist = null) => {
    if (!audioRef.current) return;
    
    setError('');
    setLoading(true);
    setIsPlaying(false);

    if (newPlaylist) {
      setPlaylist(newPlaylist);
    } else if (!playlist.some(t => t.id === track.id)) {
      setPlaylist([track]);
    }
    
    try {
      // Fetch stream file as a binary blob to pass JWT headers
      const url = generated 
        ? `/songs/stream/generated/${track.id}` 
        : `/songs/stream/${track.id}`;
        
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(response.data);

      audioRef.current.src = blobUrl;
      setCurrentTrack(track);
      setIsGenerated(generated);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        
        // Log to play history in the background
        try {
          const songId = generated ? null : track.id;
          const genId = generated ? track.id : null;
          await historyService.recordPlay(songId, genId);
        } catch (hErr) {
          console.warn("Failed to log play history:", hErr);
        }
      }
    } catch (err) {
      console.error("Playback error:", err);
      setError("Failed to load audio stream.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setError("Failed to resume playback.");
      });
    }
  };

  const seek = (time) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolume(v);
  };

  const closeTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isGenerated,
        currentTime,
        duration,
        volume,
        loading,
        error,
        audioElement: audioRef.current,
        playlist,
        setPlaylist,
        playTrack,
        togglePlay,
        seek,
        changeVolume,
        closeTrack
      }}
    >

      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};

export default PlaybackContext;
