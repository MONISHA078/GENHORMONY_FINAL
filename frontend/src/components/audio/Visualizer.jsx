import React, { useRef, useEffect } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { useEmotion } from '../../context/EmotionContext';

export const Visualizer = () => {
  const { audioElement, isPlaying } = usePlayback();
  const { currentEmotion } = useEmotion();
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const initWebAudio = () => {
      if (audioCtxRef.current) return;

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // Small size for responsive, simple bars
        
        // Connect the HTML5 audio element source node to analyser and speakers
        const source = audioCtx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (err) {
        console.warn("Web Audio API not fully supported or blocked:", err);
      }
    };

    // Initialize Web Audio on active play state (browser policy user-interaction trigger)
    if (isPlaying) {
      initWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    // Color definitions per emotion
    const moodColors = {
      HAPPY: ['#FBBF24', '#EC4899'], // Yellow to Pink
      SAD: ['#3B82F6', '#60A5FA'],    // Blue shades
      CALM: ['#10B981', '#34D399'],   // Emerald shades
      ANGRY: ['#EF4444', '#DC2626'],  // Red shades
      FEAR: ['#8B5CF6', '#A78BFA']    // Purple shades
    };

    const activeColors = moodColors[currentEmotion] || ['#8B5CF6', '#EC4899'];

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Simulated soft idle waves if paused
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 10 + 15 * Math.sin(Date.now() * 0.003 + i * 0.3);
        }
      }

      const barWidth = (width / bufferLength) * 1.6;
      let barHeight;
      let x = 0;

      // Draw bars
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8;
        
        // Setup gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, activeColors[0]);
        gradient.addColorStop(1, activeColors[1]);

        ctx.fillStyle = gradient;
        // Rounded bar caps
        ctx.fillRect(x, height - barHeight, barWidth - 3, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioElement, isPlaying, currentEmotion]);

  return (
    <canvas
      ref={canvasRef}
      width="150"
      height="40"
      className="opacity-75 max-w-[150px] h-10 hidden sm:block"
    />
  );
};

export default Visualizer;
