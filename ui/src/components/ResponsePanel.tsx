import { useMemo, useState } from 'react';
import type { Endpoint } from '../types';
import { CodeBlock } from './CodeBlock';

interface ResponsePanelProps {
  endpoint: Endpoint;
  baseUrl?: string;
  onScrollToSection?: (sectionId: string) => void;
}

function generateLLMMarkdown(endpoint: Endpoint, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${endpoint.path}` : endpoint.path;
  let md = `## ${endpoint.method} ${endpoint.path}\n\n`;

  if (endpoint.summary) {
    md += `${endpoint.summary}\n\n`;
  }

  md += `### Request\n`;
  md += `- Method: ${endpoint.method}\n`;
  md += `- URL: ${url}\n`;

  if (endpoint.headers?.length) {
    md += `- Headers:\n`;
    for (const h of endpoint.headers) {
      md += `  - ${h.name}: ${h.type}${h.required ? ' (required)' : ''}\n`;
    }
  }

  if (endpoint.queryParams?.length) {
    md += `- Query Parameters:\n`;
    for (const p of endpoint.queryParams) {
      md += `  - ${p.name}: ${p.type}${p.required ? ' (required)' : ''}${p.description ? ` - ${p.description}` : ''}\n`;
    }
  }

  if (endpoint.body) {
    md += `- Content-Type: ${endpoint.body.contentType || 'application/json'}\n`;
    if (endpoint.body.fields?.length) {
      md += `- Body fields:\n`;
      for (const f of endpoint.body.fields) {
        md += `  - ${f.name}: ${f.type}${f.required ? ' (required)' : ''}${f.description ? ` - ${f.description}` : ''}\n`;
      }
    }
    if (endpoint.body.example) {
      md += `- Body example:\n\`\`\`json\n${JSON.stringify(endpoint.body.example, null, 2)}\n\`\`\`\n`;
    }
  }

  if (endpoint.responses?.length) {
    md += `\n### Responses\n`;
    for (const r of endpoint.responses) {
      md += `\n#### ${r.status}${r.description ? ` - ${r.description}` : ''}\n`;
      if (r.example) {
        md += `\`\`\`json\n${JSON.stringify(r.example, null, 2)}\n\`\`\`\n`;
      }
    }
  }

  return md;
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

export default function ResponsePanel({ endpoint, baseUrl, onScrollToSection }: ResponsePanelProps) {
  const llmMarkdown = useMemo(() => generateLLMMarkdown(endpoint, baseUrl), [endpoint, baseUrl]);
  const [copiedLLM, setCopiedLLM] = useState(false);

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

  const handleCopyLLM = async () => {
    await navigator.clipboard.writeText(llmMarkdown);
    setCopiedLLM(true);
    setTimeout(() => setCopiedLLM(false), 2000);
  };

  return (
    <div className="w-80 border-l border-[#1e1e1e] bg-[#0a0a0a] flex flex-col overflow-y-auto">
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

      {/* Copy for LLM */}
      <div className="p-4 border-t border-[#1e1e1e] mt-auto">
        <button
          onClick={handleCopyLLM}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${copiedLLM
              ? 'bg-green-500/15 text-green-400 border-green-500/30'
              : 'bg-[#1a1a2e] hover:bg-[#252540] text-[#818cf8] border-[#2e2e4a]'
            }`}
        >
          {copiedLLM ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy for LLM
            </>
          )}
        </button>
      </div>
    </div>
  );
}
