import { useMemo } from 'react';
import type { Endpoint } from '../types';
import { CodeBlock } from './CodeBlock';

interface ResponsePanelProps {
  endpoint: Endpoint;
  baseUrl?: string;
  onScrollToSection?: (sectionId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  '2': '#22c55e',
  '3': '#3b82f6',
  '4': '#f59e0b',
  '5': '#ef4444',
};

function getStatusColor(status: number): string {
  const first = String(status)[0];
  return STATUS_COLORS[first] || '#6b7280';
}

export default function ResponsePanel({ endpoint, onScrollToSection }: ResponsePanelProps) {
  const sections = useMemo(() => {
    const items: { label: string; id: string }[] = [{ label: 'Endpoint', id: 'endpoint' }];
    if (endpoint.headers?.length) items.push({ label: 'Headers', id: 'headers' });
    if (endpoint.pathParams?.length) items.push({ label: 'Path Params', id: 'path-params' });
    if (endpoint.queryParams?.length) items.push({ label: 'Query Params', id: 'query-params' });
    if (endpoint.body) items.push({ label: 'Body', id: 'body' });
    if (endpoint.responses?.length) {
      for (const r of endpoint.responses) {
        items.push({ label: `Response ${r.status}`, id: `response-${r.status}` });
      }
    }
    if (endpoint.notes?.length) items.push({ label: 'Notes', id: 'notes' });
    return items;
  }, [endpoint]);

  return (
    <div className="w-80 border-l border-[#1e1e1e] bg-[#0a0a0a] flex flex-col h-full overflow-y-auto shrink-0">
      {/* Anchor nav */}
      <div className="p-4 border-b border-[#1e1e1e]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#555] mb-3">
          On this page
        </h3>
        <ul className="space-y-1.5">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onScrollToSection?.(section.id)}
                className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors text-left"
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Responses */}
      {endpoint.responses?.length ? (
        <div className="p-4 flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#555] mb-3">
            Responses
          </h3>
          <div className="space-y-3">
            {endpoint.responses.map((res) => (
              <div key={res.status}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                    style={{ color: getStatusColor(res.status), backgroundColor: getStatusColor(res.status) + '15' }}
                  >
                    {res.status}
                  </span>
                  {res.description && (
                    <span className="text-xs text-[#888]">{res.description}</span>
                  )}
                </div>
                {res.example != null && (
                  <CodeBlock
                    code={JSON.stringify(res.example, null, 2)}
                    title={`Response ${res.status}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
