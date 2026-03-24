import { useState, useMemo, useEffect, useRef } from 'react';
import { useDocData } from './hooks/useDocData';
import { Sidebar } from './components/Sidebar';
import { EndpointPage } from './components/EndpointPage';
import ResponsePanel from './components/ResponsePanel';
import VersionSelector from './components/VersionSelector';
import { SearchModal } from './components/SearchModal';
import type { Endpoint } from './types';

export default function App() {
  const { data, loading } = useDocData();
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<{ group: string; index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const mainRef = useRef<HTMLElement>(null);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentVersion = useMemo(() => {
    if (!data) return null;
    if (selectedVersion) {
      return data.versions.find((v) => v.name === selectedVersion) || data.versions[0];
    }
    const defaultV = data.config.versions?.find((v) => v.default);
    const found = defaultV
      ? data.versions.find((v) => v.name === defaultV.name)
      : data.versions[0];
    if (found && !selectedVersion) {
      setSelectedVersion(found.name);
    }
    return found || null;
  }, [data, selectedVersion]);

  // Filter groups by active tab
  const filteredGroups = useMemo(() => {
    if (!currentVersion) return [];
    if (!activeTab) return currentVersion.groups;
    return currentVersion.groups.map((g) => ({
      ...g,
      endpoints: g.endpoints.filter((ep) => (ep.tab || '') === activeTab),
    })).filter((g) => g.endpoints.length > 0);
  }, [currentVersion, activeTab]);

  const currentEndpoint: Endpoint | null = useMemo(() => {
    if (!currentVersion || !selectedEndpoint) return null;
    const group = currentVersion.groups.find((g) => g.group === selectedEndpoint.group);
    if (!group) return null;
    return group.endpoints[selectedEndpoint.index] || null;
  }, [currentVersion, selectedEndpoint]);

  // Scroll to section when anchor is clicked
  const scrollToSection = (sectionId: string) => {
    const el = mainRef.current?.querySelector(`[data-section="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#888] text-sm">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (!data || !currentVersion) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">PepsDoc</h1>
          <p className="text-[#888]">No documentation data found.</p>
          <p className="text-[#555] text-sm mt-2">Run <code className="bg-[#1a1a1a] px-2 py-1 rounded text-[#818cf8]">npx pepsdoc init</code> to get started.</p>
        </div>
      </div>
    );
  }

  const tabs = data.config.tabs;
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-[#1e1e1e] flex items-center justify-between px-4 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          {data.config.theme?.logo ? (
            <img src={data.config.theme.logo} alt="" className="h-6" />
          ) : (
            <span className="text-sm font-bold text-[#818cf8]">PepsDoc</span>
          )}
          <span className="text-sm font-semibold text-white">{data.config.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#666] hover:border-[#444] transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            Search...
            <kbd className="text-[10px] text-[#555] bg-[#111] px-1.5 py-0.5 rounded border border-[#333] ml-2">Ctrl+K</kbd>
          </button>
          <VersionSelector
            versions={data.versions}
            selected={selectedVersion}
            onSelect={setSelectedVersion}
          />
        </div>
      </header>

      {/* Tab bar */}
      {hasTabs && (
        <div className="h-10 border-b border-[#1e1e1e] flex items-center px-4 gap-1 bg-[#0a0a0a] shrink-0">
          <button
            onClick={() => setActiveTab('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === ''
                ? 'bg-[#1a1a2e] text-[#818cf8]'
                : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            All
          </button>
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === tab.slug
                  ? 'bg-[#1a1a2e] text-[#818cf8]'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          groups={filteredGroups}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={(group: string, index: number) => setSelectedEndpoint({ group, index })}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {currentEndpoint ? (
            <EndpointPage endpoint={currentEndpoint} baseUrl={data.config.baseUrl} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">{data.config.title}</h2>
                {data.config.description && (
                  <p className="text-[#888] max-w-md">{data.config.description}</p>
                )}
                <p className="text-[#555] text-sm mt-4">Select an endpoint from the sidebar to get started.</p>
              </div>
            </div>
          )}
        </main>

        {/* Response Panel (right) */}
        {currentEndpoint && (
          <ResponsePanel
            endpoint={currentEndpoint}
            baseUrl={data.config.baseUrl}
            onScrollToSection={scrollToSection}
          />
        )}
      </div>

      {/* Search Modal (Cmd+K) */}
      <SearchModal
        groups={filteredGroups}
        onSelect={(group: string, index: number) => setSelectedEndpoint({ group, index })}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
