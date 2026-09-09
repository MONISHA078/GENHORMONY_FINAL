import React, { useState } from 'react';
import emotionService from '../../services/emotionService';
import { useEmotion } from '../../context/EmotionContext';
import { Send, Loader, Sparkles, Smile, CloudRain, Shield, AlertTriangle, Wind } from 'lucide-react';

export const TextAnalyzer = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentEmotion, scores, updateEmotion } = useEmotion();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await emotionService.analyzeText(text);
      updateEmotion(data.detected_emotion, data.scores, 'TEXT');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze text emotion.');
    } finally {
      setLoading(false);
    }
  };

  const emotionEmojis = {
    HAPPY: '☀️ Joyful',
    SAD: '🌧️ Melancholic',
    CALM: '🌊 Peaceful',
    ANGRY: '🔥 Furious',
    FEAR: '🌑 Anxious'
  };

  return (
    <div className="bg-harmony-card border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-harmony-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Text Sentiment Analysis</h2>
          <p className="text-xs text-harmony-muted">Express how you are feeling in writing</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="4"
          placeholder="Describe your current state or write down thoughts... (e.g. 'I had an amazing and joyful day under the bright sun!')"
          className="w-full p-4 bg-[#1B1926] border border-white/5 rounded-2xl text-white placeholder-harmony-muted/40 focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm resize-none"
          required
        ></textarea>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/10"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Analyzing patterns...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Analyze Mood
            </>
          )}
        </button>
      </form>

      {/* Sentiment Scores Visualization */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-harmony-muted uppercase tracking-wider font-semibold">Mood Score Matrix</span>
          <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-1 rounded-full">
            Active: {emotionEmojis[currentEmotion] || currentEmotion}
          </span>
        </div>

        <div className="space-y-3">
          {Object.entries(scores).map(([emotion, val]) => {
            const pct = Math.round(val * 100);
            return (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white/80">{emotion}</span>
                  <span className="text-harmony-muted">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      emotion === 'HAPPY' ? 'bg-amber-400' :
                      emotion === 'SAD' ? 'bg-blue-400' :
                      emotion === 'CALM' ? 'bg-emerald-400' :
                      emotion === 'ANGRY' ? 'bg-red-400' :
                      'bg-purple-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;
