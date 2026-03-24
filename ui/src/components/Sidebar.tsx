import { useState, useMemo } from 'react';
import type { EndpointGroup } from '../types';

interface SidebarProps {
  groups: EndpointGroup[];
  selectedEndpoint: { group: string; index: number } | null;
  onSelectEndpoint: (group: string, index: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const methodColors: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-purple-400',
  DELETE: 'text-red-400',
  HEAD: 'text-gray-400',
  OPTIONS: 'text-gray-400',
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide ${methodColors[method] ?? 'text-gray-400'} w-12 shrink-0`}
    >
      {method}
    </span>
  );
}

export function Sidebar({
  groups,
  selectedEndpoint,
  onSelectEndpoint,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        endpoints: group.endpoints.filter(
          (ep) =>
            ep.path.toLowerCase().includes(query) ||
            (ep.summary && ep.summary.toLowerCase().includes(query)),
        ),
      }))
      .filter((group) => group.endpoints.length > 0);
  }, [groups, searchQuery]);

  function toggleGroup(groupName: string) {
    setCollapsed((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  }

  function isSelected(groupName: string, index: number) {
    return (
      selectedEndpoint !== null &&
      selectedEndpoint.group === groupName &&
      selectedEndpoint.index === index
    );
  }

  return (
    <aside className="w-72 h-full shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md py-1.5 pl-9 pr-3 text-sm text-[#ccc] placeholder-[#555] outline-none focus:border-[#444] transition-colors"
          />
        </div>
      </div>

      {/* Groups */}
      <nav className="flex-1 overflow-y-auto px-1 pb-4">
        {filteredGroups.map((group) => {
          const isCollapsed = collapsed[group.group] === true;

          return (
            <div key={group.group} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#888] hover:text-[#aaa] transition-colors cursor-pointer"
              >
                <svg
                  className={`w-3 h-3 shrink-0 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {group.group}
              </button>

              {/* Endpoints */}
              {!isCollapsed && (
                <div className="flex flex-col gap-px">
                  {group.endpoints.map((endpoint, idx) => {
                    const selected = isSelected(group.group, idx);

                    return (
                      <button
                        key={`${endpoint.method}-${endpoint.path}-${idx}`}
                        onClick={() => onSelectEndpoint(group.group, idx)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md transition-colors cursor-pointer ${selected
                            ? 'bg-[#1a1a2e]'
                            : 'hover:bg-[#1a1a1a]'
                          }`}
                      >
                        <MethodBadge method={endpoint.method} />
                        <span
                          className={`text-sm truncate ${endpoint.deprecated ? 'line-through opacity-50' : ''} ${selected ? 'text-[#e0e0e0]' : 'text-[#999]'
                            }`}
                        >
                          {endpoint.path}
                        </span>
                        {endpoint.deprecated && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/10 text-red-400 shrink-0">DEP</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && searchQuery.trim() !== '' && (
          <p className="text-[#555] text-sm text-center mt-8 px-4">
            No endpoints match "{searchQuery}"
          </p>
        )}
      </nav>
    </aside>
  );
}
