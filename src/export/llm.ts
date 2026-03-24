/**
 * PepsDoc - LLM Export
 * Gera markdown otimizado para IA a partir da documentação
 */

import type { PepsDocData, Endpoint, EndpointGroup } from '../core/schema';

/** Gera markdown de um endpoint específico (botão "Copy for LLM") */
export function endpointToLLM(endpoint: Endpoint, baseUrl?: string): string {
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
      md += `  - ${p.name}: ${p.type}${p.required ? ' (required)' : ''}${p.description ? ` — ${p.description}` : ''}\n`;
    }
  }

  if (endpoint.body) {
    md += `- Content-Type: ${endpoint.body.contentType || 'application/json'}\n`;
    if (endpoint.body.fields?.length) {
      md += `- Body fields:\n`;
      for (const f of endpoint.body.fields) {
        md += `  - ${f.name}: ${f.type}${f.required ? ' (required)' : ''}${f.description ? ` — ${f.description}` : ''}\n`;
      }
    }
    if (endpoint.body.example) {
      md += `- Body example:\n\`\`\`json\n${JSON.stringify(endpoint.body.example, null, 2)}\n\`\`\`\n`;
    }
  }

  if (endpoint.responses?.length) {
    md += `\n### Responses\n`;
    for (const r of endpoint.responses) {
      md += `\n#### ${r.status}${r.description ? ` — ${r.description}` : ''}\n`;
      if (r.example) {
        md += `\`\`\`json\n${JSON.stringify(r.example, null, 2)}\n\`\`\`\n`;
      }
    }
  }

  return md;
}

/** Gera markdown completo de toda a documentação (export para IA de frontend) */
export function dataToLLM(data: PepsDocData, baseUrl?: string): string {
  let md = `# ${data.config.title} — API Reference\n\n`;

  if (data.config.description) {
    md += `${data.config.description}\n\n`;
  }

  if (baseUrl) {
    md += `Base URL: \`${baseUrl}\`\n\n`;
  }

  md += `---\n\n`;

  for (const version of data.versions) {
    md += `## Version: ${version.name}`;
    if (version.badge) md += ` (${version.badge})`;
    md += `\n\n`;

    for (const group of version.groups) {
      md += `### ${group.group}\n\n`;

      for (const endpoint of group.endpoints) {
        md += endpointToLLM(endpoint, baseUrl);
        md += `\n---\n\n`;
      }
    }
  }

  return md;
}
