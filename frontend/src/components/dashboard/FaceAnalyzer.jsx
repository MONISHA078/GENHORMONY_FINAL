import React, { useState, useRef, useEffect } from 'react';
import emotionService from '../../services/emotionService';
import { useEmotion } from '../../context/EmotionContext';
import { Webcam, Camera, CameraOff, Loader, AlertTriangle } from 'lucide-react';

export const FaceAnalyzer = () => {
  const [streamActive, setStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentEmotion, scores, updateEmotion } = useEmotion();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Clean up webcam stream on unmount
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300, facingMode: 'user' }
      });
      videoRef.current.srcObject = stream;
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

  const handleCapture = () => {
    if (!streamActive || !videoRef.current || !canvasRef.current) return;

    setLoading(true);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw current video frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert frame to JPG blob and send
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture frame from video feed.');
        setLoading(false);
        return;
      }
      
      try {
        const data = await emotionService.analyzeFace(blob);
        updateEmotion(data.detected_emotion, data.scores, 'FACE');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to analyze expression.');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.9);
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
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-harmony-accent">
          <Webcam className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-sans">Face Sentiment Analysis</h2>
          <p className="text-xs text-harmony-muted">Detect mood using facial expressions</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-[#13111C]/40 border border-white/5 rounded-2xl relative overflow-hidden">
        {/* Hidden Canvas for capture snaps */}
        <canvas ref={canvasRef} className="hidden" />

        {streamActive ? (
          <div className="relative w-full max-w-[360px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-emerald-500/20">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Live Feed
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[360px] aspect-[4/3] rounded-xl bg-[#0B0A0F] border border-white/5 flex flex-col items-center justify-center text-harmony-muted text-xs space-y-2 py-10">
            <CameraOff className="h-8 w-8 text-harmony-muted/30" />
            <span>Webcam stream is inactive</span>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6 w-full">
          {!streamActive ? (
            <button
              onClick={startWebcam}
              className="px-6 py-2.5 rounded-xl bg-[#1B1926] hover:bg-white/5 text-white border border-white/5 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Start Camera
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={stopWebcam}
                className="px-4 py-2.5 rounded-xl bg-[#1B1926] hover:bg-red-500/10 text-harmony-muted hover:text-red-400 border border-white/5 font-semibold text-xs transition-all"
              >
                Stop Feed
              </button>
              <button
                onClick={handleCapture}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-harmony-primary hover:bg-violet-600 text-white font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/10"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Analyzing frame...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Capture & Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>
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

export default FaceAnalyzer;
