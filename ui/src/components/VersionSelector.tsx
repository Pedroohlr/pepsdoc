import type { VersionData } from '../types';

interface VersionSelectorProps {
  versions: VersionData[];
  selected: string;
  onSelect: (version: string) => void;
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  stable: { bg: 'bg-green-500/15', text: 'text-green-400' },
  beta: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  deprecated: { bg: 'bg-gray-500/15', text: 'text-gray-400' },
  experimental: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
};

export default function VersionSelector({ versions, selected, onSelect }: VersionSelectorProps) {
  if (versions.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {versions.map((v) => {
        const isActive = v.name === selected;
        const badge = v.badge ? BADGE_STYLES[v.badge] || BADGE_STYLES.stable : null;

        return (
          <button
            key={v.name}
            onClick={() => onSelect(v.name)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#1a1a2e] text-white border border-[#2e2e4a]'
                : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            {v.name}
            {badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                {v.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
