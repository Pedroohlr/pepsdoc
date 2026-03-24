import { useState, useEffect, useMemo, useRef } from 'react';
import type { EndpointGroup, Endpoint } from '../types';

interface SearchResult {
  group: string;
  endpoint: Endpoint;
  index: number;
}

interface SearchModalProps {
  groups: EndpointGroup[];
  onSelect: (group: string, index: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280',
};

export function SearchModal({ groups, onSelect, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      const all: SearchResult[] = [];
      for (const group of groups) {
        for (let i = 0; i < group.endpoints.length; i++) {
          all.push({ group: group.group, endpoint: group.endpoints[i], index: i });
        }
      }
      return all;
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    for (const group of groups) {
      for (let i = 0; i < group.endpoints.length; i++) {
        const ep = group.endpoints[i];
        if (
          ep.path.toLowerCase().includes(q) ||
          ep.summary.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          group.group.toLowerCase().includes(q)
        ) {
          matches.push({ group: group.group, endpoint: ep, index: i });
        }
      }
    }

    return matches;
  }, [groups, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const result = results[selectedIndex];
        onSelect(result.group, result.index);
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-[#2a2a2a]">
          <svg className="w-5 h-5 text-[#555] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search endpoints..."
            className="flex-1 bg-transparent py-4 text-sm text-white placeholder-[#555] outline-none"
          />
          <kbd className="text-[10px] text-[#555] bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-[#555] text-sm">
              No endpoints found
            </div>
          ) : (
            results.map((result, i) => (
              <button
                key={`${result.group}-${result.endpoint.method}-${result.endpoint.path}-${i}`}
                onClick={() => {
                  onSelect(result.group, result.index);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                  i === selectedIndex ? 'bg-[#1e1e2e]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <span
                  className="text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0"
                  style={{
                    color: METHOD_COLORS[result.endpoint.method] || '#6b7280',
                    backgroundColor: (METHOD_COLORS[result.endpoint.method] || '#6b7280') + '20',
                  }}
                >
                  {result.endpoint.method}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white font-mono truncate block">
                    {result.endpoint.path}
                  </span>
                  <span className="text-xs text-[#666] truncate block">
                    {result.group} &middot; {result.endpoint.summary}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#2a2a2a] text-[10px] text-[#555]">
          <span><kbd className="bg-[#1e1e1e] px-1 py-0.5 rounded border border-[#333] mr-1">&uarr;</kbd><kbd className="bg-[#1e1e1e] px-1 py-0.5 rounded border border-[#333]">&darr;</kbd> navigate</span>
          <span><kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">Enter</kbd> select</span>
          <span><kbd className="bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
