import React, { useState, useEffect } from 'react';
import { useEmotion } from '../../context/EmotionContext';
import { usePlayback } from '../../context/PlaybackContext';
import songService from '../../services/songService';
import {
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
  RotateCw,
  Heart,
  Loader,
  AlertTriangle
} from 'lucide-react';

const fallbackCovers = [
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&q=80'
];

export const PredefinedPlayer = () => {
  const { currentEmotion } = useEmotion();
  const { playTrack, currentTrack, isPlaying, togglePlay, currentTime, duration, seek } = usePlayback();
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active states
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [favorites, setFavorites] = useState({});

  const currentTrackId = currentTrack?.id;
  const isCurrentTrackPredefined = currentTrack && (!currentTrack.file_path || !currentTrack.file_path.includes('generated_music'));

  // Load recommendations on emotion update
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await songService.getRecommendations(currentEmotion);
        setSongs(data);
      } catch (err) {
        setError('Failed to fetch song recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentEmotion]);

  // Next Track Action
  const handleNext = () => {
    if (songs.length === 0) return;
    if (isShuffle) {
      const randIndex = Math.floor(Math.random() * songs.length);
      playTrack(songs[randIndex], false, songs);
      return;
    }
    const currIndex = songs.findIndex((s) => s.id === currentTrackId);
    const nextIndex = currIndex === -1 || currIndex === songs.length - 1 ? 0 : currIndex + 1;
    playTrack(songs[nextIndex], false, songs);
  };

  // Previous Track Action
  const handlePrev = () => {
    if (songs.length === 0) return;
    const currIndex = songs.findIndex((s) => s.id === currentTrackId);
    const prevIndex = currIndex === -1 || currIndex === 0 ? songs.length - 1 : currIndex - 1;
    playTrack(songs[prevIndex], false, songs);
  };

  // Handle loop end behavior if repeat is set
  useEffect(() => {
    if (isRepeat && isPlaying && currentTime >= duration - 0.2) {
      seek(0);
    }
  }, [currentTime, duration, isRepeat, isPlaying]);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === undefined) return '00:00';
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  const getTrackCover = (track) => {
    if (!track) return fallbackCovers[0];
    return track.cover_url || fallbackCovers[track.id % fallbackCovers.length];
  };

  // Active track information
  const activeTrack = isCurrentTrackPredefined 
    ? currentTrack 
    : (songs.length > 0 ? songs[0] : null);

  const activeTrackIndex = songs.findIndex((s) => s.id === activeTrack?.id);
  
  // Create Up Next queue (exclude the currently playing song or display upcoming items)
  const upNextQueue = songs.filter((s) => s.id !== activeTrack?.id);

  // Toggle favorite on active track
  const toggleFavorite = (trackId) => {
    setFavorites(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2 mb-6">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-harmony-card/40 border border-white/5 rounded-3xl">
          <Loader className="h-8 w-8 text-harmony-primary animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16 text-harmony-muted text-xs border border-dashed border-white/5 rounded-3xl bg-harmony-card/30">
          No recommended songs found. Please seed song data in the database.
        </div>
      ) : (
        /* Split Grid layout matching the screenshot */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* LEFT COLUMN: Active Track Player Card */}
          <div className="lg:col-span-3 bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            
            {/* Song details */}
            <div className="flex items-center gap-6">
              {/* Rounded cover photo */}
              <div 
                className="w-24 h-24 rounded-2xl bg-cover bg-center border border-white/5 shadow-lg shadow-black/40 flex-shrink-0"
                style={{ backgroundImage: `url(${getTrackCover(activeTrack)})` }}
              ></div>
              
              <div className="flex-1 flex items-center justify-between min-w-0 pr-2">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-xl font-extrabold text-white tracking-tight truncate">
                    {activeTrack?.title || 'Unknown Track'}
                  </h3>
                  <p className="text-sm text-harmony-muted font-bold truncate">
                    {activeTrack?.artist || 'Unknown Artist'}
                  </p>
                </div>
                
                {/* Heart Toggle */}
                <button
                  onClick={() => activeTrack && toggleFavorite(activeTrack.id)}
                  className="p-2 rounded-full hover:bg-white/5 transition-all flex-shrink-0"
                >
                  <Heart
                    className={`h-6 w-6 transition-all ${
                      favorites[activeTrack?.id] 
                        ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                        : 'text-harmony-muted hover:text-white'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Timeline Seek Progress slider */}
            <div className="space-y-3">
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={isCurrentTrackPredefined ? currentTime : 0}
                  onChange={(e) => isCurrentTrackPredefined && seek(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`
                  }}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none accent-white transition-all [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/50"
                />
              </div>
              
              <div className="flex justify-between text-xs text-harmony-muted font-mono font-semibold">
                <span>{isCurrentTrackPredefined ? formatTime(currentTime) : '00:00'}</span>
                <span>{formatTime(duration || activeTrack?.duration || 233)}</span>
              </div>
            </div>

            {/* Media Player Controls */}
            <div className="flex items-center justify-center gap-8 pt-2">
              {/* Shuffle button */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 transition-all ${
                  isShuffle ? 'text-harmony-primary hover:text-purple-400' : 'text-harmony-muted hover:text-white'
                }`}
                title="Shuffle queue"
              >
                <Shuffle className="h-5 w-5" />
              </button>

              {/* Prev button */}
              <button
                onClick={handlePrev}
                className="p-2 text-harmony-muted hover:text-white active:scale-90 transition-all"
                title="Previous track"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  if (isCurrentTrackPredefined) {
                    togglePlay();
                  } else if (activeTrack) {
                    playTrack(activeTrack, false, songs);
                  }
                }}
                className="w-14 h-14 rounded-full bg-white hover:bg-white/95 text-[#0F0C1B] flex items-center justify-center shadow-lg active:scale-95 transition-all flex-shrink-0"
              >
                {isPlaying && isCurrentTrackPredefined ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                )}
              </button>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="p-2 text-harmony-muted hover:text-white active:scale-90 transition-all"
                title="Next track"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>

              {/* Repeat button */}
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 transition-all ${
                  isRepeat ? 'text-harmony-primary hover:text-purple-400' : 'text-harmony-muted hover:text-white'
                }`}
                title="Repeat track"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Up Next Queue list */}
          <div className="lg:col-span-2 bg-[#13111C]/65 border border-white/5 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md min-h-[420px]">
            <h3 className="text-sm font-extrabold text-white tracking-tight pl-1">
              Up Next
            </h3>

            <div className="divide-y divide-white/5 space-y-3.5 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin">
              {upNextQueue.length === 0 ? (
                <div className="text-center py-10 text-harmony-muted text-xs font-semibold">
                  Queue is empty
                </div>
              ) : (
                upNextQueue.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playTrack(song, false, songs)}
                    className="flex items-center justify-between pt-3.5 first:pt-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Album Art Cover */}
                      <div 
                        className="w-11 h-11 rounded-lg bg-cover bg-center border border-white/5 flex-shrink-0 group-hover:border-harmony-primary/30 transition-all"
                        style={{ backgroundImage: `url(${getTrackCover(song)})` }}
                      ></div>
                      
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-harmony-primary transition-colors truncate max-w-[130px]">
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-harmony-muted mt-0.5 truncate max-w-[130px] font-medium">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-harmony-muted group-hover:text-white transition-colors font-semibold">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PredefinedPlayer;
