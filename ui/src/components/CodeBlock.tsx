import { useState, useCallback } from 'react'

interface CodeBlockProps {
  code: string
  title?: string
}

function highlightJson(raw: string): string {
  return raw.replace(
    /("(?:\\.|[^"\\])*")\s*:/g,
    '<span style="color:#67e8f9">$1</span>:',
  )
    .replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      (match, value) => match.replace(value, `<span style="color:#4ade80">${value}</span>`),
    )
    .replace(
      /(?<=[:,[\s])\s*("(?:\\.|[^"\\])*")(?=\s*[,\]\n\r}])/g,
      '<span style="color:#4ade80">$1</span>',
    )
    .replace(
      /\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
      '<span style="color:#fb923c">$1</span>',
    )
    .replace(
      /\b(true|false)\b/g,
      '<span style="color:#c084fc">$1</span>',
    )
    .replace(
      /\bnull\b/g,
      '<span style="color:#f87171">null</span>',
    )
}

export function CodeBlock({ code, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API may not be available
    }
  }, [code])

  const highlighted = highlightJson(code)

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      {title && (
        <div className="px-4 py-2 text-xs font-medium text-neutral-400 border-b border-white/10" style={{ backgroundColor: '#1a1a1a' }}>
          {title}
        </div>
      )}

      <div className="relative" style={{ backgroundColor: '#111111' }}>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: copied ? '#22c55e' : '#2a2a2a',
            color: copied ? '#fff' : '#a3a3a3',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <pre className="p-4 pr-20 overflow-x-auto text-sm leading-relaxed">
          <code
            className="font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  )
}
