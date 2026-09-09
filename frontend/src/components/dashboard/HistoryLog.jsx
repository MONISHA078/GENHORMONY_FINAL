import React, { useState, useEffect } from 'react';
import historyService from '../../services/historyService';
import { usePlayback } from '../../context/PlaybackContext';
import {
  Calendar,
  Loader,
  AlertTriangle,
  Play,
  Pause,
  Disc,
  X,
  Activity,
  Music
} from 'lucide-react';

export const HistoryLog = () => {
  const [playHistory, setPlayHistory] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View states
  const [activeTab, setActiveTab] = useState('emotion'); // 'emotion' | 'listening'
  const [selectedRecord, setSelectedRecord] = useState(null); // Holds active record for Modal view
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback();

  const currentTrackId = currentTrack?.id;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [plays, emotions] = await Promise.all([
        historyService.getPlayHistory(),
        historyService.getEmotionHistory(),
      ]);
      setPlayHistory(plays);
      setEmotionHistory(emotions);
    } catch (err) {
      setError('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMethod = (item) => {
    const scores = [];
    if (item.text_score !== null && item.text_score > 0) scores.push('Text');
    if (item.speech_score !== null && item.speech_score > 0) scores.push('Speech');
    if (item.face_score !== null && item.face_score > 0) scores.push('Face');
    
    if (scores.length === 1) return scores[0];
    if (scores.length > 1) return 'Fusion';
    return 'Text'; // fallback
  };

  const getResult = (item) => {
    const fusionScore = item.fusion_score !== null ? item.fusion_score : 0.85;
    return `${Math.round(fusionScore * 100)}%`;
  };

  const emotionMetadata = {
    HAPPY: { label: 'Happy', emoji: '😊', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    CALM: { label: 'Relaxed', emoji: '😌', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    SAD: { label: 'Sad', emoji: '😢', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    ANGRY: { label: 'Angry', emoji: '😡', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    FEAR: { label: 'Fear', emoji: '😨', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  };

  const getEmotionDetails = (mood) => {
    const norm = (mood || '').toUpperCase();
    return emotionMetadata[norm] || {
      label: mood || 'Neutral',
      emoji: '😐',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    };
  };

  const handlePlayItem = (item) => {
    if (item.song) {
      const playlistSongs = playHistory.filter(i => i.song).map(i => i.song);
      playTrack(item.song, false, playlistSongs);
    } else if (item.generated_music) {
      const playlistGen = playHistory.filter(i => i.generated_music).map(i => i.generated_music);
      playTrack(item.generated_music, true, playlistGen);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher matching screenshot layout */}
      <div className="flex bg-[#191724]/40 border border-white/5 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('emotion')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'emotion'
              ? 'bg-harmony-primary text-white shadow-lg shadow-purple-500/10'
              : 'text-harmony-muted hover:text-white'
          }`}
        >
          Emotion History
        </button>
        <button
          onClick={() => setActiveTab('listening')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'listening'
              ? 'bg-harmony-primary text-white shadow-lg shadow-purple-500/10'
              : 'text-harmony-muted hover:text-white'
          }`}
        >
          Listening History
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Content Container */}
      <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm overflow-hidden min-h-[350px]">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader className="h-8 w-8 text-harmony-primary animate-spin" />
          </div>
        ) : activeTab === 'emotion' ? (
          
          /* EMOTION HISTORY TABLE */
          emotionHistory.length === 0 ? (
            <div className="text-center py-20 text-harmony-muted text-xs border border-dashed border-white/5 rounded-2xl">
              No emotional captures logged. Try inputting text, voice, or face scans!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-bold text-harmony-muted uppercase tracking-wider">
                    <th className="pb-4 pt-1 pl-4">Date & Time</th>
                    <th className="pb-4 pt-1">Emotion</th>
                    <th className="pb-4 pt-1">Method</th>
                    <th className="pb-4 pt-1">Result</th>
                    <th className="pb-4 pt-1 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emotionHistory.map((item) => {
                    const emo = getEmotionDetails(item.detected_emotion);
                    return (
                      <tr key={item.id} className="text-xs text-white/90 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-4 font-semibold text-white/70">
                          {formatDateTime(item.timestamp)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">{emo.emoji}</span>
                            <span className="font-bold">{emo.label}</span>
                          </div>
                        </td>
                        <td className="py-4 text-harmony-muted font-medium">
                          {getMethod(item)}
                        </td>
                        <td className="py-4 font-mono font-bold text-emerald-400">
                          {getResult(item)}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="text-harmony-primary hover:text-purple-400 font-bold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          
          /* LISTENING HISTORY TABLE */
          playHistory.length === 0 ? (
            <div className="text-center py-20 text-harmony-muted text-xs border border-dashed border-white/5 rounded-2xl">
              No playback history records found. Start listening to recommendations!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-bold text-harmony-muted uppercase tracking-wider">
                    <th className="pb-4 pt-1 pl-4">Date & Time</th>
                    <th className="pb-4 pt-1">Track Title</th>
                    <th className="pb-4 pt-1">Artist / Source</th>
                    <th className="pb-4 pt-1 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {playHistory.map((item) => {
                    const isCurrent = currentTrackId === (item.song?.id || item.generated_music?.id);
                    return (
                      <tr key={item.id} className="text-xs text-white/90 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-4 font-semibold text-white/70">
                          {formatDateTime(item.played_at)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {isCurrent && isPlaying ? (
                              <Disc className="h-3.5 w-3.5 text-harmony-primary animate-spin" />
                            ) : (
                              <Music className="h-3.5 w-3.5 text-harmony-muted" />
                            )}
                            <span className={`font-bold ${isCurrent ? 'text-harmony-primary' : 'text-white'}`}>
                              {item.song ? item.song.title : (item.generated_music?.prompt || 'AI Audio Sequence')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-harmony-muted font-medium">
                          {item.song ? item.song.artist : 'AI Generated Soundtrack'}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={() => handlePlayItem(item)}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-harmony-primary hover:text-white text-harmony-muted transition-all inline-flex items-center justify-center"
                            title="Play Track"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* DETAIL OVERLAY MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#13111C] border border-white/10 rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-extrabold text-white">Sentiment Fusion Audit</h4>
                <p className="text-[11px] text-harmony-muted mt-0.5">{formatDateTime(selectedRecord.timestamp)}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-harmony-muted hover:text-white transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              
              {/* Overall detected result */}
              <div className="p-4 bg-[#191724]/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-harmony-muted font-semibold">Detected Emotion</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEmotionDetails(selectedRecord.detected_emotion).emoji}</span>
                  <span className="text-sm font-extrabold text-white">
                    {getEmotionDetails(selectedRecord.detected_emotion).label}
                  </span>
                </div>
              </div>

              {/* Individual Modality parameters listing */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-harmony-muted font-medium">Text Sentiment Score</span>
                  <span className="font-mono text-white font-bold">
                    {selectedRecord.text_score !== null ? `${Math.round(selectedRecord.text_score * 100)}%` : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-harmony-muted font-medium">Vocal Pitch Score</span>
                  <span className="font-mono text-white font-bold">
                    {selectedRecord.speech_score !== null ? `${Math.round(selectedRecord.speech_score * 100)}%` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-harmony-muted font-medium">Facial Expression Score</span>
                  <span className="font-mono text-white font-bold">
                    {selectedRecord.face_score !== null ? `${Math.round(selectedRecord.face_score * 100)}%` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between text-xs py-1 pt-2">
                  <span className="text-harmony-primary font-bold">Fused Confidence Score</span>
                  <span className="font-mono text-emerald-400 font-extrabold text-sm">
                    {Math.round((selectedRecord.fusion_score || 0.85) * 100)}%
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer button */}
            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-harmony-primary hover:bg-harmony-primary/95 text-white font-bold text-xs transition-all active:scale-[0.98]"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryLog;
