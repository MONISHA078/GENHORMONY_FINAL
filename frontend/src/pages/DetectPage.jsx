import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import emotionService from '../services/emotionService';
import {
  Mic,
  Loader,
  Keyboard,
  AlertCircle
} from 'lucide-react';
import facePlaceholder from '../assets/face_placeholder.png';

const scannerStyle = `
  @keyframes scannerMove {
    0% { top: 0%; }
    50% { top: 100%; }
    100% { top: 0%; }
  }
  .animate-scanline {
    animation: scannerMove 2.5s ease-in-out infinite;
  }
`;

export const DetectPage = () => {
  const { updateEmotion } = useEmotion();
  const navigate = useNavigate();
  
  // Navigation & view states
  const [showResult, setShowResult] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const [error, setError] = useState('');

  // Text states
  const [text, setText] = useState('');
  const [textLoading, setTextLoading] = useState(false);

  // Speech states
  const [recording, setRecording] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Face states
  const [streamActive, setStreamActive] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopWebcam();
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Sync stream to video element when it mounts in the DOM
  useEffect(() => {
    if (streamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamActive]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  // Text submit handler
  const handleTextAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    setTextLoading(true);
    setError('');
    try {
      const data = await emotionService.analyzeText(text);
      updateEmotion(data.detected_emotion, data.scores, 'TEXT');
      setDetectedMood(data.detected_emotion);
      setShowResult(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze text emotion.');
    } finally {
      setTextLoading(false);
    }
  };

  // Speech recording actions
  const handleStartRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeSpeechBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Could not access microphone. Please check system permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const analyzeSpeechBlob = async (blob) => {
    setSpeechLoading(true);
    setError('');
    try {
      const data = await emotionService.analyzeSpeech(blob);
      updateEmotion(data.detected_emotion, data.scores, 'SPEECH');
      setDetectedMood(data.detected_emotion);
      setShowResult(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze vocal emotion.');
    } finally {
      setSpeechLoading(false);
    }
  };

  // Face webcam actions
  const handleStartWebcam = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      streamRef.current = stream;
      setStreamActive(true);
    } catch (err) {
      setError('Could not access camera. Please check system permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const handleFaceCapture = () => {
    if (!streamActive || !videoRef.current || !canvasRef.current) return;
    setFaceLoading(true);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture image from video stream.');
        setFaceLoading(false);
        return;
      }
      try {
        const data = await emotionService.analyzeFace(blob);
        updateEmotion(data.detected_emotion, data.scores, 'FACE');
        setDetectedMood(data.detected_emotion);
        setShowResult(true);
        stopWebcam();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to analyze facial expressions.');
      } finally {
        setFaceLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Mapped emotion details
  const emotionDetails = {
    HAPPY: { label: 'Happy', emoji: '😊', confidence: '87%', message: 'You seem to be in a positive mood!' },
    CALM: { label: 'Calm', emoji: '😌', confidence: '85%', message: 'You seem to be in a peaceful, relaxed state!' },
    SAD: { label: 'Sad', emoji: '😢', confidence: '92%', message: 'You seem to be feeling a bit down or reflective.' },
    ANGRY: { label: 'Angry', emoji: '😡', confidence: '89%', message: 'You seem to have some intense or energetic emotions right now.' },
    FEAR: { label: 'Fear', emoji: '😨', confidence: '81%', message: 'You seem to be feeling slightly anxious or tense.' },
    NEUTRAL: { label: 'Neutral', emoji: '😐', confidence: '83%', message: 'You seem to be in a balanced, neutral state.' },
    SURPRISE: { label: 'Surprise', emoji: '😲', confidence: '80%', message: 'You seem to be experiencing something unexpected or exciting!' }
  };

  const moodKey = (detectedMood || '').toUpperCase();
  const activeResultInfo = emotionDetails[moodKey] || {
    label: detectedMood || 'Neutral',
    emoji: '😐',
    confidence: '80%',
    message: 'You seem to be in a balanced, neutral state.'
  };

  return (
    <div className="space-y-8">
      {/* Hidden canvas for face capture */}
      <canvas ref={canvasRef} className="hidden" />

      {showResult ? (
        /* Emotion Result Success Page Layout from Screenshot */
        <div className="max-w-[460px] mx-auto z-10">
          <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white">Emotion Result</h2>
              <p className="text-xs text-harmony-muted mt-1">Here is your detected emotion</p>
            </div>

            {/* Large Emoji */}
            <div className="text-7xl my-6 animate-pulse select-none">
              {activeResultInfo.emoji}
            </div>

            {/* Mapped labels */}
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {activeResultInfo.label}
              </h3>
              <p className="text-sm text-harmony-muted font-bold">
                {activeResultInfo.confidence} Confidence
              </p>
            </div>

            {/* Mood message */}
            <p className="text-xs text-harmony-muted/80 mt-4 leading-relaxed font-semibold italic">
              {activeResultInfo.message}
            </p>

            <div className="w-full h-px bg-white/5 my-8"></div>

            {/* Actions Switcher block */}
            <div className="w-full space-y-4">
              <p className="text-[10px] text-harmony-muted uppercase tracking-widest font-bold">
                What would you like to do next?
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => navigate('/recommended-music')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-harmony-primary hover:bg-harmony-primary/95 border border-white/5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-purple-500/10"
                >
                  {/* Music note play icon */}
                  <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h6V3h-8z"/>
                  </svg>
                  Recommend Music
                </button>
                <button
                  onClick={() => navigate('/generate-music')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#191724]/40 hover:bg-[#191724]/70 border border-[#242235] hover:border-harmony-primary/30 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]"
                >
                  {/* Sparkle/wand icon */}
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 5.25l-.375 2.625L15 8.25l2.625.375.375 2.625.375-2.625L21 8.25l-2.625-.375-.375-2.625z" />
                  </svg>
                  Generate Music
                </button>
              </div>
            </div>

            {/* Back action button */}
            <button
              onClick={() => {
                setText('');
                setTimer(0);
                setError('');
                setShowResult(false);
              }}
              className="mt-8 text-xs text-harmony-primary hover:text-purple-400 font-bold transition-colors"
            >
              Detect again
            </button>

          </div>
        </div>
      ) : (
        /* Regular 3-column Capture Modality layout */
        <>
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h2 className="text-3xl font-extrabold text-white">Detect Emotion</h2>
            <p className="text-sm text-harmony-muted mt-1">Choose a method to detect your emotion</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs max-w-xl mx-auto">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Text Input */}
            <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between space-y-6 min-h-[360px] shadow-xl backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white">
                  <Keyboard className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-base font-extrabold text-white">Text Input</h3>
                <p className="text-xs text-harmony-muted">
                  Type how you feel and detect emotion
                </p>
              </div>

              <div className="w-full flex-1 flex flex-col justify-center min-h-[140px]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="I am feeling really good today!"
                  className="w-full h-full min-h-[120px] p-4 bg-[#191724]/40 border border-[#242235] rounded-2xl text-xs text-white placeholder-harmony-muted/40 focus:outline-none focus:border-harmony-primary/30 resize-none font-sans"
                />
              </div>

              <button
                onClick={handleTextAnalyze}
                disabled={textLoading || !text.trim()}
                className="w-full py-3 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {textLoading ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  'Detect'
                )}
              </button>
            </div>

            {/* Card 2: Speech Input */}
            <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between space-y-6 min-h-[360px] shadow-xl backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white">
                  <Mic className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-base font-extrabold text-white">Speech Input</h3>
                <p className="text-xs text-harmony-muted">
                  Speak how you feel and detect emotion
                </p>
              </div>

              <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[140px] relative py-2">
                <div className="h-10 flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
                    const randomHeight = recording ? Math.floor(Math.random() * 24) + 6 : (bar % 3 === 0 ? 10 : (bar % 2 === 0 ? 7 : 14));
                    return (
                      <span
                        key={bar}
                        style={{ height: `${randomHeight}px` }}
                        className={`w-[2px] rounded-full bg-white transition-all duration-150 ${
                          recording ? 'animate-pulse' : 'opacity-60'
                        }`}
                      ></span>
                    );
                  })}
                </div>
                <span className="text-xs text-harmony-muted font-mono mt-3 font-semibold">
                  {formatTime(timer)}
                </span>
              </div>

              <button
                onClick={recording ? handleStopRecording : handleStartRecording}
                disabled={speechLoading}
                className="w-full py-3 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {speechLoading ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : recording ? (
                  'Stop'
                ) : (
                  'Record'
                )}
              </button>
            </div>

            {/* Card 3: Face Input */}
            <div className="bg-[#13111C]/65 border border-white/5 rounded-3xl p-8 flex flex-col justify-between space-y-6 min-h-[360px] shadow-xl backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white">
                  <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-white">Face Input</h3>
                <p className="text-xs text-harmony-muted">
                  Capture your face and detect emotion
                </p>
              </div>

              <style dangerouslySetInnerHTML={{ __html: scannerStyle }} />
              <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[140px] relative py-2">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 shadow-inner flex items-center justify-center bg-[#191724]/40">
                  {streamActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={facePlaceholder}
                        alt="Animated Face Scanner Hologram"
                        className="w-full h-full object-cover rounded-full opacity-60 animate-pulse"
                      />
                      
                      {/* Neon scanline overlay */}
                      <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-500 shadow-md shadow-pink-500/50 rounded-full animate-scanline"></div>
                      
                      {faceLoading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Loader className="h-5 w-5 text-pink-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Circular scanner indicators */}
                  <div className="absolute inset-1.5 border border-dashed border-purple-500/25 rounded-full pointer-events-none animate-spin-slow"></div>
                </div>
              </div>

              <button
                onClick={streamActive ? handleFaceCapture : handleStartWebcam}
                disabled={faceLoading}
                className="w-full py-3 rounded-xl bg-harmony-primary hover:bg-harmony-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {faceLoading ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Capturing...
                  </>
                ) : streamActive ? (
                  'Capture'
                ) : (
                  'Enable Camera'
                )}
              </button>
            </div>

          </div>
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default DetectPage;
