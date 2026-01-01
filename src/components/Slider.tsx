'use client';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  vertical?: boolean;
  color?: string;
  showValue?: boolean;
  unit?: string;
}

export function Slider({
  value,
  min,
  max,
  label,
  onChange,
  vertical = false,
  color = '#00ff88',
  showValue = true,
  unit = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-2 h-full">
        <span className="text-xs text-zinc-400 text-center">{label}</span>
        <div className="relative flex-1 w-8 min-h-[100px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-full bg-zinc-800 rounded-full overflow-hidden relative">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            </div>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
            }}
          />
        </div>
        {showValue && (
          <span className="text-xs font-mono text-zinc-300">
            {value}{unit}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">{label}</span>
        {showValue && (
          <span className="text-xs font-mono text-zinc-300">
            {value}{unit}
          </span>
        )}
      </div>
      <div className="relative h-3">
        <div className="absolute inset-0 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
