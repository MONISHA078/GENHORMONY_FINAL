import React, { useState } from 'react';
import { useEmotion } from '../../context/EmotionContext';
import emotionService from '../../services/emotionService';
import { GitMerge, HelpCircle, Loader, RefreshCw, Sparkles } from 'lucide-react';

export const EmotionSelector = () => {
  const { currentEmotion, scores, updateEmotion } = useEmotion();
  const [fusing, setFusing] = useState(false);
  const [error, setError] = useState('');

  // Local simulated scores to demonstrate decision level fusion
  const [simText, setSimText] = useState({ HAPPY: 0.8, SAD: 0.05, CALM: 0.1, ANGRY: 0.02, FEAR: 0.03 });
  const [simSpeech, setSimSpeech] = useState({ HAPPY: 0.4, SAD: 0.1, CALM: 0.2, ANGRY: 0.2, FEAR: 0.1 });
  const [simFace, setSimFace] = useState({ HAPPY: 0.7, SAD: 0.05, CALM: 0.15, ANGRY: 0.05, FEAR: 0.05 });

  const handleFuse = async () => {
    setFusing(true);
    setError('');
    try {
      const data = await emotionService.fuseEmotions(simText, simSpeech, simFace);
      updateEmotion(data.detected_emotion, data.scores, 'FUSION');
    } catch (err) {
      setError('Multimodal Fusion request failed.');
    } finally {
      setFusing(false);
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
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-harmony-primary">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-sans">Multimodal Fusion Center</h2>
            <p className="text-xs text-harmony-muted">Decision-level weighted fuser</p>
          </div>
        </div>
        <button
          onClick={handleFuse}
          disabled={fusing}
          className="px-4 py-2 bg-harmony-primary hover:bg-violet-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
        >
          {fusing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Fuse Sensors
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modality 1: Text */}
        <div className="p-4 bg-[#1B1926]/40 border border-white/5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Text Channel</span>
            <span className="text-[10px] bg-purple-500/10 text-harmony-primary px-2 py-0.5 rounded-full font-bold">W: 35%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-harmony-muted">
              <span>Primary: HAPPY</span>
              <span>80%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>

        {/* Modality 2: Speech */}
        <div className="p-4 bg-[#1B1926]/40 border border-white/5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Speech Channel</span>
            <span className="text-[10px] bg-pink-500/10 text-harmony-secondary px-2 py-0.5 rounded-full font-bold">W: 35%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-harmony-muted">
              <span>Primary: HAPPY</span>
              <span>40%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

        {/* Modality 3: Face */}
        <div className="p-4 bg-[#1B1926]/40 border border-white/5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Face Channel</span>
            <span className="text-[10px] bg-emerald-500/10 text-harmony-accent px-2 py-0.5 rounded-full font-bold">W: 30%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-harmony-muted">
              <span>Primary: HAPPY</span>
              <span>70%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-harmony-primary/5 border border-harmony-primary/10 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-harmony-muted uppercase tracking-wider font-semibold">Unified Fused Emotion Output</p>
          <p className="text-xl font-black text-white mt-1 uppercase">
            {emotionEmojis[currentEmotion] || currentEmotion}
          </p>
        </div>
        <div className="text-right text-[10px] text-harmony-muted leading-relaxed">
          Confidence distributions are combined dynamically.<br />
          Updates predefined recommendations.
        </div>
      </div>
    </div>
  );
};

export default EmotionSelector;
