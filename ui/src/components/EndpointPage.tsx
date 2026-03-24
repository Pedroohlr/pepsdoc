import { CodeBlock } from './CodeBlock'
import type { Endpoint, ParamField } from '../types'

interface EndpointPageProps {
  endpoint: Endpoint
  baseUrl?: string
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

const NOTE_BORDER_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  tip: '#22c55e',
  danger: '#ef4444',
}

function ParamTable({ title, fields }: { title: string; fields: ParamField[] }) {
  return (
    <section className="mt-8">
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

  return (
    <div className="h-full overflow-y-auto px-8 py-10" style={{ color: '#e5e5e5' }}>
      {/* Header: method badge + path */}
      <div className="flex items-center gap-3 flex-wrap">
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
        <ParamTable title="Headers" fields={endpoint.headers} />
      )}

      {/* Path Parameters */}
      {endpoint.pathParams && endpoint.pathParams.length > 0 && (
        <ParamTable title="Path Parameters" fields={endpoint.pathParams} />
      )}

      {/* Query Parameters */}
      {endpoint.queryParams && endpoint.queryParams.length > 0 && (
        <ParamTable title="Query Parameters" fields={endpoint.queryParams} />
      )}

      {/* Request Body */}
      {endpoint.body && (
        <section className="mt-8">
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

      {/* Notes */}
      {endpoint.notes && endpoint.notes.length > 0 && (
        <section className="mt-8">
          <h3 className="text-base font-semibold mb-3" style={{ color: '#fff' }}>
            Notes
          </h3>
          <div className="space-y-3">
            {endpoint.notes.map((note, idx) => (
              <div
                key={idx}
                className="rounded-lg px-4 py-3"
                style={{
                  borderLeft: `3px solid ${NOTE_BORDER_COLORS[note.type] ?? '#3b82f6'}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                {note.title && (
                  <p className="font-semibold text-sm mb-1" style={{ color: '#fff' }}>
                    {note.title}
                  </p>
                )}
                <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
