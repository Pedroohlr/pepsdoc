import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import type { Endpoint, ParamField } from '../types'

interface EndpointPageProps {
  endpoint: Endpoint
  baseUrl?: string
}

function generateLLMMarkdown(endpoint: Endpoint, baseUrl?: string): string {
  const url = baseUrl ? `${baseUrl}${endpoint.path}` : endpoint.path
  let md = `## ${endpoint.method} ${endpoint.path}\n\n`
  if (endpoint.summary) md += `${endpoint.summary}\n\n`
  md += `### Request\n- Method: ${endpoint.method}\n- URL: ${url}\n`
  if (endpoint.headers?.length) {
    md += `- Headers:\n`
    for (const h of endpoint.headers) md += `  - ${h.name}: ${h.type}${h.required ? ' (required)' : ''}\n`
  }
  if (endpoint.queryParams?.length) {
    md += `- Query Parameters:\n`
    for (const p of endpoint.queryParams) md += `  - ${p.name}: ${p.type}${p.required ? ' (required)' : ''}${p.description ? ` - ${p.description}` : ''}\n`
  }
  if (endpoint.body) {
    md += `- Content-Type: ${endpoint.body.contentType || 'application/json'}\n`
    if (endpoint.body.fields?.length) {
      md += `- Body fields:\n`
      for (const f of endpoint.body.fields) md += `  - ${f.name}: ${f.type}${f.required ? ' (required)' : ''}${f.description ? ` - ${f.description}` : ''}\n`
    }
    if (endpoint.body.example) md += `- Body example:\n\`\`\`json\n${JSON.stringify(endpoint.body.example, null, 2)}\n\`\`\`\n`
  }
  if (endpoint.responses?.length) {
    md += `\n### Responses\n`
    for (const r of endpoint.responses) {
      md += `\n#### ${r.status}${r.description ? ` - ${r.description}` : ''}\n`
      if (r.example) md += `\`\`\`json\n${JSON.stringify(r.example, null, 2)}\n\`\`\`\n`
    }
  }
  return md
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280',
}

function getMethodColor(method: string): string {
  return METHOD_COLORS[method.toUpperCase()] ?? '#6b7280'
}

const NOTE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  info:    { bg: 'rgba(59,130,246,0.08)',  text: '#60a5fa', icon: 'i' },
  warning: { bg: 'rgba(245,158,11,0.08)', text: '#fbbf24', icon: '!' },
  tip:     { bg: 'rgba(34,197,94,0.08)',  text: '#4ade80', icon: '✓' },
  danger:  { bg: 'rgba(239,68,68,0.08)',  text: '#f87171', icon: '✕' },
}

function ParamTable({ title, fields, sectionId }: { title: string; fields: ParamField[]; sectionId?: string }) {
  return (
    <section className="mt-8" data-section={sectionId}>
      <h3 className="text-base font-semibold mb-3" style={{ color: '#fff' }}>
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm" style={{ backgroundColor: '#1e1e1e' }}>
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Name</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Type</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Required</th>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-2.5 font-mono text-sm" style={{ color: '#e5e5e5' }}>
                  {field.name}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#888' }}>
                  {field.type}
                </td>
                <td className="px-4 py-2.5">
                  {field.required ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                      required
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#555' }}>optional</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-sm" style={{ color: '#888' }}>
                  {field.description ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function EndpointPage({ endpoint, baseUrl }: EndpointPageProps) {
  const methodColor = getMethodColor(endpoint.method)
  const fullPath = baseUrl ? `${baseUrl}${endpoint.path}` : endpoint.path
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateLLMMarkdown(endpoint, baseUrl))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-8 py-10 min-h-full" style={{ color: '#e5e5e5' }}>
      {/* Header: method badge + path + Copy for LLM */}
      <div className="flex items-center gap-3 flex-wrap" data-section="endpoint">
        <span
          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold tracking-wide text-white select-none shrink-0"
          style={{ backgroundColor: methodColor }}
        >
          {endpoint.method.toUpperCase()}
        </span>
        <span
          className={`font-mono text-lg ${endpoint.deprecated ? 'line-through opacity-60' : ''}`}
          style={{ color: '#e5e5e5' }}
        >
          {fullPath}
        </span>
        {endpoint.deprecated && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}
          >
            deprecated
          </span>
        )}
        <button
          onClick={handleCopy}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer shrink-0 ${
            copied
              ? 'bg-green-500/15 text-green-400 border-green-500/30'
              : 'bg-[#1a1a2e] hover:bg-[#252540] text-[#818cf8] border-[#2e2e4a]'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy for LLM
            </>
          )}
        </button>
      </div>

      {/* Summary + Description */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold" style={{ color: '#fff' }}>
          {endpoint.summary}
        </h2>
        {endpoint.description && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: '#888' }}>
            {endpoint.description}
          </p>
        )}
      </div>

      {/* Headers */}
      {endpoint.headers && endpoint.headers.length > 0 && (
        <ParamTable title="Headers" fields={endpoint.headers} sectionId="headers" />
      )}

      {/* Path Parameters */}
      {endpoint.pathParams && endpoint.pathParams.length > 0 && (
        <ParamTable title="Path Parameters" fields={endpoint.pathParams} sectionId="path-params" />
      )}

      {/* Query Parameters */}
      {endpoint.queryParams && endpoint.queryParams.length > 0 && (
        <ParamTable title="Query Parameters" fields={endpoint.queryParams} sectionId="query-params" />
      )}

      {/* Request Body */}
      {endpoint.body && (
        <section className="mt-8" data-section="body">
          <h3 className="text-base font-semibold mb-3" style={{ color: '#fff' }}>
            Request Body
          </h3>

          {endpoint.body.contentType && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium mb-4"
              style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
            >
              {endpoint.body.contentType}
            </span>
          )}

          {endpoint.body.fields && endpoint.body.fields.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-white/10 mt-3">
              <table className="w-full text-sm" style={{ backgroundColor: '#1e1e1e' }}>
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Name</th>
                    <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Type</th>
                    <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Required</th>
                    <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#888' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.body.fields.map((field) => (
                    <tr key={field.name} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-2.5 font-mono text-sm" style={{ color: '#e5e5e5' }}>
                        {field.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#888' }}>
                        {field.type}
                      </td>
                      <td className="px-4 py-2.5">
                        {field.required ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                            required
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#555' }}>optional</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm" style={{ color: '#888' }}>
                        {field.description ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.body.example != null && (
            <div className="mt-4">
              <CodeBlock
                code={JSON.stringify(endpoint.body.example, null, 2)}
                title="Example Request Body"
              />
            </div>
          )}
        </section>
      )}

      {/* Responses inline (for scroll targets) */}
      {endpoint.responses && endpoint.responses.length > 0 && (
        <section className="mt-8">
          {endpoint.responses.map((res) => (
            <div key={res.status} data-section={`response-${res.status}`} />
          ))}
        </section>
      )}

      {/* Notes */}
      {endpoint.notes && endpoint.notes.length > 0 && (
        <section className="mt-8" data-section="notes">
          <h3 className="text-base font-semibold mb-3" style={{ color: '#fff' }}>
            Notes
          </h3>
          <div className="space-y-3">
            {endpoint.notes.map((note, idx) => {
              const style = NOTE_COLORS[note.type] ?? NOTE_COLORS.info
              return (
              <div
                key={idx}
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: style.bg }}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: style.text + '22', color: style.text }}
                  >
                    {style.icon}
                  </span>
                  <div>
                    {note.title && (
                      <p className="font-semibold text-sm mb-0.5" style={{ color: style.text }}>
                        {note.title}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed" style={{ color: '#aaa' }}>
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
