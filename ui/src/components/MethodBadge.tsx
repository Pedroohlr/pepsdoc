const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280',
}

interface MethodBadgeProps {
  method: string
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const upper = method.toUpperCase()
  const color = METHOD_COLORS[upper] ?? '#6b7280'

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide text-white select-none"
      style={{ backgroundColor: color }}
    >
      {upper}
    </span>
  )
}
