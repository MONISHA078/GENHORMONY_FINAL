import React, { useState, useRef, useEffect } from 'react';
import emotionService from '../../services/emotionService';
import { useEmotion } from '../../context/EmotionContext';
import { Mic, Square, Loader, AlertTriangle, Play, CheckCircle } from 'lucide-react';

export const SpeechAnalyzer = () => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const { currentEmotion, scores, updateEmotion } = useEmotion();

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const recordingBuffersRef = useRef([]);
  const recordingLengthRef = useRef(0);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const encodeWAV = (buffers, totalLength, sampleRate) => {
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      result.set(buffers[i], offset);
      offset += buffers[i].length;
    }

    const buffer = new ArrayBuffer(44 + result.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + result.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM = 1
    view.setUint16(22, 1, true); // Mono = 1
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, result.length * 2, true);

    let index = 44;
    for (let i = 0; i < result.length; i++) {
      let s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    setError('');
    setAudioUrl(null);
    setAudioBlob(null);
    recordingBuffersRef.current = [];
    recordingLengthRef.current = 0;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        recordingBuffersRef.current.push(new Float32Array(channelData));
        recordingLengthRef.current += channelData.length;
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setRecording(true);
      
      // Start timer
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Could not access microphone. Please check system permissions.');
    }
  };

  const stopRecording = () => {
    if (recording) {
      setRecording(false);
      clearInterval(timerIntervalRef.current);

      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const sampleRate = audioContextRef.current ? audioContextRef.current.sampleRate : 44100;
      const wavBlob = encodeWAV(recordingBuffersRef.current, recordingLengthRef.current, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      setAudioBlob(wavBlob);
      setAudioUrl(audioUrl);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError('');
    try {
      const data = await emotionService.analyzeSpeech(audioBlob);
      updateEmotion(data.detected_emotion, data.scores, 'SPEECH');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze vocal emotion.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
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
        <div className="p-2.5 rounded-xl bg-pink-500/10 text-harmony-secondary">
          <Mic className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Vocal Sentiment Analysis</h2>
          <p className="text-xs text-harmony-muted">Record a short audio sample of your voice</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-[#13111C]/40 border border-white/5 rounded-2xl text-center space-y-4">
        {recording ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
            <span className="text-lg font-bold text-white tracking-widest">{formatTime(timer)}</span>
          </div>
        ) : (
          <span className="text-xs text-harmony-muted">Press record and speak for 3-5 seconds</span>
        )}

        <div className="flex justify-center gap-4">
          {!recording ? (
            <button
              onClick={startRecording}
              className="p-4 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
            >
              <Mic className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="p-4 rounded-full bg-[#1B1926] border border-white/10 text-red-500 hover:bg-white/5 active:scale-95 transition-all"
            >
              <Square className="h-6 w-6 fill-current" />
            </button>
          )}
        </div>

        {audioUrl && !recording && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2">
              <audio src={audioUrl} controls className="h-10 mx-auto max-w-[240px]" />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-harmony-primary hover:bg-violet-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/10"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Analyzing vocal frequencies...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Analyze Recorded Voice
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Sentiment scores */}
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

export default SpeechAnalyzer;
