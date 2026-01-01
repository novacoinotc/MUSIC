'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize analyzer
    analyzerRef.current = new Tone.Analyser('waveform', 256);
    Tone.getDestination().connect(analyzerRef.current);

    const draw = () => {
      if (!ctx || !analyzerRef.current || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      // Get waveform data
      const values = analyzerRef.current.getValue() as Float32Array;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;

      const sliceWidth = width / values.length;
      let x = 0;

      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        const y = ((v + 1) / 2) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Draw center line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 1; i < 4; i++) {
        const gridY = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(width, gridY);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyzerRef.current?.dispose();
    };
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-32 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
