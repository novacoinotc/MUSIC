'use client';

import { useTrackStore } from '@/stores/trackStore';
import type { TrackSection, SectionConfig } from '@/types';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

const SECTION_COLORS: Record<TrackSection, string> = {
  intro: '#4ade80',
  buildup: '#facc15',
  drop: '#ef4444',
  breakdown: '#818cf8',
  bridge: '#f472b6',
  outro: '#22d3ee',
};

const SECTION_LABELS: Record<TrackSection, string> = {
  intro: 'INTRO',
  buildup: 'BUILD',
  drop: 'DROP',
  breakdown: 'BREAK',
  bridge: 'BRIDGE',
  outro: 'OUTRO',
};

export function StructureBuilder() {
  const sections = useTrackStore((s) => s.sections);
  const updateSection = useTrackStore((s) => s.updateSection);
  const addSection = useTrackStore((s) => s.addSection);
  const removeSection = useTrackStore((s) => s.removeSection);
  const reorderSections = useTrackStore((s) => s.reorderSections);

  const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);

  const handleAddSection = (type: TrackSection) => {
    const newSection: SectionConfig = {
      type,
      bars: 8,
      hasKick: type === 'drop' || type === 'buildup' || type === 'outro',
      hasBass: type === 'drop' || type === 'buildup',
      hasMelody: type === 'drop' || type === 'breakdown',
      hasHihat: type !== 'breakdown',
      hasPad: type !== 'drop',
      hasPluck: type === 'drop',
      hasStab: type === 'drop',
      hasPiano: type === 'breakdown',
      hasStrings: type === 'intro' || type === 'breakdown',
      hasAcid: false,
      hasPerc: type === 'drop' || type === 'buildup',
      hasFx: type === 'buildup' || type === 'intro',
      hasArp: type === 'drop' || type === 'buildup',
      hasVocal: type === 'breakdown' || type === 'buildup',
      intensity: type === 'drop' ? 100 : type === 'buildup' ? 60 : 40,
    };
    addSection(newSection);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    reorderSections(newSections);
  };

  const toggleElement = (index: number, element: keyof SectionConfig) => {
    const current = sections[index][element];
    if (typeof current === 'boolean') {
      updateSection(index, { [element]: !current });
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">STRUCTURE</h3>
        <span className="text-sm text-zinc-400">{totalBars} bars</span>
      </div>

      {/* Timeline visualization */}
      <div className="flex gap-1 mb-4 h-12 rounded-lg overflow-hidden">
        {sections.map((section, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 flex items-center justify-center transition-all hover:opacity-80"
            style={{
              width: `${(section.bars / totalBars) * 100}%`,
              minWidth: 60,
              backgroundColor: SECTION_COLORS[section.type],
            }}
          >
            <span className="text-xs font-bold text-black/70">
              {SECTION_LABELS[section.type]}
            </span>
            <span className="absolute bottom-1 text-[10px] text-black/50">
              {section.bars}b
            </span>
          </div>
        ))}
      </div>

      {/* Section list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sections.map((section, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: SECTION_COLORS[section.type] }}
            />

            <select
              value={section.type}
              onChange={(e) => updateSection(i, { type: e.target.value as TrackSection })}
              className="bg-zinc-700 text-white text-xs px-2 py-1 rounded border-none outline-none"
            >
              {Object.entries(SECTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={section.bars}
              onChange={(e) => updateSection(i, { bars: parseInt(e.target.value) || 8 })}
              className="w-12 bg-zinc-700 text-white text-xs px-2 py-1 rounded text-center"
              min={4}
              max={32}
              step={4}
            />
            <span className="text-xs text-zinc-500">bars</span>

            {/* Element toggles - Row 1: Core instruments */}
            <div className="flex flex-wrap gap-1 ml-auto">
              {(['hasKick', 'hasBass', 'hasMelody', 'hasHihat', 'hasPad', 'hasArp', 'hasVocal', 'hasPerc'] as const).map((el) => {
                const labels: Record<string, string> = {
                  hasKick: 'K',
                  hasBass: 'B',
                  hasMelody: 'M',
                  hasHihat: 'H',
                  hasPad: 'P',
                  hasArp: 'A',
                  hasVocal: 'V',
                  hasPerc: 'C',
                };
                const colors: Record<string, string> = {
                  hasKick: '#ff4444',
                  hasBass: '#ff8844',
                  hasMelody: '#00ccff',
                  hasHihat: '#ffcc00',
                  hasPad: '#aa44ff',
                  hasArp: '#00ff88',
                  hasVocal: '#ff66cc',
                  hasPerc: '#ff9900',
                };
                return (
                  <button
                    key={el}
                    onClick={() => toggleElement(i, el)}
                    className={`w-5 h-5 text-[10px] rounded flex items-center justify-center font-bold transition-all ${
                      section[el]
                        ? 'text-white'
                        : 'bg-zinc-700 text-zinc-500'
                    }`}
                    style={section[el] ? { backgroundColor: colors[el] } : {}}
                    title={el.replace('has', '')}
                  >
                    {labels[el]}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-1">
              <button
                onClick={() => moveSection(i, 'up')}
                disabled={i === 0}
                className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveSection(i, 'down')}
                disabled={i === sections.length - 1}
                className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeSection(i)}
                disabled={sections.length <= 1}
                className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 disabled:opacity-30"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add section buttons */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {Object.entries(SECTION_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => handleAddSection(type as TrackSection)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span style={{ color: SECTION_COLORS[type as TrackSection] }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
