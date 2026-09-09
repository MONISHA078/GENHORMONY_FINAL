import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import { usePlayback } from '../context/PlaybackContext';
import songService from '../services/songService';
import {
  Play,
  Pause,
  Heart,
  Loader,
  AlertTriangle,
  ChevronDown,
  Search
} from 'lucide-react';

const fallbackCovers = [
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&q=80'
];

export const RecommendedMusicPage = () => {
  const { currentEmotion } = useEmotion();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback();
  const navigate = useNavigate();
  
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});

  const currentTrackId = currentTrack?.id;
  const isCurrentTrackPredefined = currentTrack && (!currentTrack.file_path || !currentTrack.file_path.includes('generated_music'));

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

  const formatDuration = (secs) => {
    if (!secs) return '03:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTrackCover = (song) => {
    if (!song) return fallbackCovers[0];
    return song.cover_url || fallbackCovers[song.id % fallbackCovers.length];
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) => ({
      ...prev,
      [songId]: !prev[songId]
    }));
  };

  const moodLabels = {
    HAPPY: 'Happy',
    CALM: 'Relaxed',
    SAD: 'Sad',
    ANGRY: 'Angry',
    FEAR: 'Fear'
  };

  const currentMoodName = moodLabels[currentEmotion] || currentEmotion || 'Neutral';

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Page Header matching screenshot */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Recommended Songs</h2>
        <p className="text-sm text-harmony-muted mt-1.5 font-medium">
          Songs that match your mood:{' '}
          <span className="text-amber-400 font-bold">{currentMoodName}</span>
        </p>
      </div>

      {/* Filter and Search controls bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Filters dropdown button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#191724]/60 hover:bg-[#191724] border border-white/5 rounded-xl text-xs font-bold text-white transition-all">
          Filters
          <ChevronDown className="h-4 w-4 text-harmony-muted" />
        </button>

        {/* Right: Search box */}
        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#13111C]/60 border border-white/5 rounded-xl text-xs text-white placeholder-harmony-muted/50 focus:outline-none focus:border-harmony-primary/30 transition-all font-medium"
          />
          <Search className="h-4 w-4 text-harmony-muted/60 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Playlist Content Card */}
      <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-sm min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 text-harmony-primary animate-spin" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-16 text-harmony-muted text-xs border border-dashed border-white/5 rounded-2xl bg-[#191724]/20">
            No matching recommended songs found.
          </div>
        ) : (
          <div className="divide-y divide-white/5 space-y-4">
            {filteredSongs.map((song) => {
              const isCurrent = currentTrackId === song.id && isCurrentTrackPredefined;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between pt-4 first:pt-0 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Cover Art thumbnail */}
                    <div
                      className="w-14 h-14 rounded-xl bg-cover bg-center border border-white/5 shadow-md flex-shrink-0"
                      style={{ backgroundImage: `url(${getTrackCover(song)})` }}
                    ></div>
                    
                    <div className="min-w-0 space-y-0.5">
                      <h4 className={`text-sm font-extrabold truncate max-w-[200px] ${isCurrent ? 'text-harmony-primary' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-harmony-muted font-bold truncate max-w-[200px]">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Right hand details and actions */}
                  <div className="flex items-center gap-8 text-harmony-muted flex-shrink-0 pl-4">
                    {/* Duration */}
                    <span className="text-xs font-semibold font-mono pr-2">
                      {formatDuration(song.duration)}
                    </span>

                    {/* Circular Outline Play Button */}
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          togglePlay();
                        } else {
                          playTrack(song, false, filteredSongs);
                        }
                      }}
                      className="w-9 h-9 rounded-full border border-white/20 hover:border-white/60 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="h-4 w-4 fill-current text-white" />
                      ) : (
                        <Play className="h-4 w-4 fill-current text-white ml-0.5" />
                      )}
                    </button>

                    {/* Favorites Heart */}
                    <button
                      onClick={() => toggleFavorite(song.id)}
                      className="p-1 rounded-full hover:bg-white/5 transition-all"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          favorites[song.id]
                            ? 'text-pink-500 fill-pink-500'
                            : 'hover:text-white text-harmony-muted'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate AI Music CTA */}
      <div className="bg-gradient-to-r from-purple-950/20 via-pink-950/15 to-violet-950/20 border border-purple-500/15 rounded-3xl p-8 shadow-xl text-center space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-harmony-muted">
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="text-[10px] uppercase tracking-widest font-bold">Want something original?</span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <p className="text-xs text-harmony-muted/80 font-medium">
          Let AI create a unique track tailored to your <span className="text-amber-400 font-bold">{currentMoodName}</span> mood
        </p>
        <button
          onClick={() => navigate('/generate-music')}
          className="inline-flex items-center justify-center gap-2 py-3 px-8 bg-harmony-primary hover:bg-harmony-primary/90 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-purple-500/15"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 5.25l-.375 2.625L15 8.25l2.625.375.375 2.625.375-2.625L21 8.25l-2.625-.375-.375-2.625z" />
          </svg>
          ✨ Generate AI Music
        </button>
      </div>

    </div>
  );
};

export default RecommendedMusicPage;
