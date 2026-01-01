'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Knob({
  value,
  min,
  max,
  label,
  onChange,
  size = 'md',
  color = '#00ff88',
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(value);

  const sizes = {
    sm: { outer: 48, inner: 36, text: 'text-xs' },
    md: { outer: 64, inner: 48, text: 'text-sm' },
    lg: { outer: 80, inner: 60, text: 'text-base' },
  };

  const { outer, inner, text } = sizes[size];
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 270 - 135; // -135 to 135 degrees

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = value;
    },
    [value]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = range / 100;
      const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity));
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative cursor-pointer select-none"
        style={{ width: outer, height: outer }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring */}
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${percentage * 2.83} 283`}
            strokeLinecap="round"
            transform="rotate(-135 50 50)"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>

        {/* Inner knob */}
        <div
          className="absolute rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-lg"
          style={{
            width: inner,
            height: inner,
            left: (outer - inner) / 2,
            top: (outer - inner) / 2,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute w-1 h-3 rounded-full left-1/2 -translate-x-1/2 top-1"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <span className={`${text} text-zinc-400 text-center`}>{label}</span>
      <span className={`${text} font-mono text-zinc-300`}>{value}</span>
    </div>
  );
}
