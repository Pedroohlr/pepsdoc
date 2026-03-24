#!/usr/bin/env node

/**
 * PepsDoc CLI
 * Usage:
 *   npx pepsdoc init      - Initialize pepsdoc/ folder
 *   npx pepsdoc build     - Compile documentation data
 *   npx pepsdoc export    - Export to markdown/LLM format
 *   npx pepsdoc validate  - Validate JSON files
 */

import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import { Storage } from '../core/storage';
import { DEFAULT_CONFIG } from '../core/config';
import { dataToLLM } from '../export/llm';
import { dataToOpenAPI } from '../export/openapi';

const args = process.argv.slice(2);
const command = args[0];
const projectRoot = process.cwd();

function printBanner(): void {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════════╗');
  console.log('  ║                                                       ║');
  console.log('  ║   PepsDoc - API documentation, beautifully automated  ║');
  console.log('  ║                                                       ║');
  console.log('  ╚═══════════════════════════════════════════════════════╝');
  console.log('');
}

function printOnboarding(): void {
  console.log('  ┌───────────────────────────────────────────────────────┐');
  console.log('  │                                                       │');
  console.log('  │   Copy the text below and paste it in your AI chat:   │');
  console.log('  │                                                       │');
  console.log('  │   Read the PepsDoc AI skill at:                       │');
  console.log(`  │   ${path.join('node_modules', 'pepsdoc', 'templates', 'ai-skill.md')}  │`);
  console.log('  │                                                       │');
  console.log('  │   Then ask your AI to document your backend using     │');
  console.log('  │   the PepsDoc framework.                              │');
  console.log('  │                                                       │');
  console.log('  └───────────────────────────────────────────────────────┘');
  console.log('');
}

function cmdInit(): void {
  const storage = new Storage(projectRoot);

  if (storage.isInitialized()) {
    console.log('  PepsDoc is already initialized in this project.');
    console.log(`  Config: ${path.join('pepsdoc', 'pepsdoc.config.json')}`);
    return;
  }

  storage.init(DEFAULT_CONFIG);

  printBanner();
  console.log('  Initialized successfully!');
  console.log('');
  console.log(`  Created: pepsdoc/`);
  console.log(`  Created: pepsdoc/pepsdoc.config.json`);
  console.log(`  Created: pepsdoc/data/v1/`);
  console.log('');
  printOnboarding();
}

function cmdBuild(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const data = storage.compile();
  const outDir = path.join(projectRoot, 'pepsdoc', '.build');
  fs.mkdirSync(outDir, { recursive: true });

  // Gera o data.json compilado
  fs.writeFileSync(
    path.join(outDir, 'data.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  );

  console.log('');
  console.log(`  Build complete!`);
  console.log(`  Output: pepsdoc/.build/data.json`);
  console.log(`  Versions: ${data.versions.map((v) => v.name).join(', ') || 'none'}`);
  console.log(`  Groups: ${data.versions.reduce((acc, v) => acc + v.groups.length, 0)}`);
  console.log(`  Endpoints: ${data.versions.reduce((acc, v) => acc + v.groups.reduce((a, g) => a + g.endpoints.length, 0), 0)}`);
  console.log('');
}

function cmdExport(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const format = args[1] || 'llm';
  const data = storage.compile();

  if (format === 'llm' || format === 'markdown') {
    const md = dataToLLM(data);
    const outPath = path.join(projectRoot, 'pepsdoc-api-reference.md');
    fs.writeFileSync(outPath, md, 'utf-8');
    console.log('');
    console.log(`  Exported to: pepsdoc-api-reference.md`);
    console.log('  You can copy this file and paste it into your AI chat to build the frontend.');
    console.log('');
  } else if (format === 'openapi') {
    const versionArg = args[2];
    const spec = dataToOpenAPI(data, versionArg);
    const outPath = path.join(projectRoot, 'openapi.json');
    fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), 'utf-8');
    console.log('');
    console.log(`  Exported to: openapi.json`);
    console.log(`  OpenAPI 3.0.3 spec for version: ${spec.info.version}`);
    console.log('');
  } else {
    console.error(`  Unknown export format: ${format}`);
    console.error('  Available: llm, markdown, openapi');
    process.exit(1);
  }
}

function cmdValidate(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const versions = storage.listVersions();
  let errors = 0;
  let total = 0;

  for (const version of versions) {
    const groups = storage.readGroups(version);
    for (const group of groups) {
      total++;
      if (!group.group) {
        console.error(`  [ERROR] ${version}: Missing "group" field`);
        errors++;
      }
      if (!group.endpoints || !Array.isArray(group.endpoints)) {
        console.error(`  [ERROR] ${version}/${group.group}: Missing or invalid "endpoints" array`);
        errors++;
      }
      for (const ep of group.endpoints) {
        if (!ep.method || !ep.path) {
          console.error(`  [ERROR] ${version}/${group.group}: Endpoint missing method or path`);
          errors++;
        }
      }
    }
  }

  console.log('');
  if (errors === 0) {
    console.log(`  Validation passed! ${total} groups checked, 0 errors.`);
  } else {
    console.log(`  Validation failed: ${errors} error(s) found in ${total} groups.`);
  }
  console.log('');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  return mimes[ext] || 'application/octet-stream';
}

function cmdDev(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const portArg = args.find((a) => a.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1], 10) : 4000;

  // Resolve UI build dir (same logic as express adapter)
  const uiBuildDir = path.join(__dirname, '..', '..', 'ui', 'build');
  const hasUI = fs.existsSync(uiBuildDir);

  // SSE clients for live reload
  const sseClients: http.ServerResponse[] = [];

  // Notify all connected clients to reload
  function notifyReload(): void {
    for (const client of sseClients) {
      try {
        client.write('data: reload\n\n');
      } catch {
        // client disconnected
      }
    }
  }

  // Watch pepsdoc/ directory for changes
  const watchDir = storage.dir;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function startWatching(): void {
    try {
      fs.watch(watchDir, { recursive: true }, (_event, filename) => {
        if (!filename || !filename.endsWith('.json')) return;

        // Debounce to avoid multiple rapid reloads
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const ts = new Date().toLocaleTimeString();
          console.log(`  [${ts}] Changed: ${filename} → reloading`);
          notifyReload();
        }, 200);
      });
    } catch {
      console.log('  Warning: File watching not available. Manual refresh required.');
    }
  }

  // Create HTTP server
  const server = http.createServer((req, res) => {
    const url = req.url || '/';

    // CORS headers for dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API: compiled documentation data
    if (url === '/docs/api/data') {
      try {
        const data = storage.compile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to compile documentation' }));
      }
      return;
    }

    // SSE endpoint for live reload
    if (url === '/docs/__reload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write('data: connected\n\n');
      sseClients.push(res);

      req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
      return;
    }

    // Serve UI static files
    if (!hasUI) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head><title>PepsDoc Dev</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff}.c{text-align:center;max-width:500px}code{background:#1a1a2e;padding:2px 8px;border-radius:4px;color:#818cf8}</style>
</head>
<body><div class="c">
<h1>PepsDoc Dev Server</h1>
<p>UI build not found.</p>
<p>Run <code>cd ui && npm run build</code> first, then restart the dev server.</p>
<p style="color:#888;margin-top:2rem">API is active at <a href="/docs/api/data" style="color:#818cf8">/docs/api/data</a></p>
</div></body></html>`);
      return;
    }

    // Map URL to file path
    let filePath: string;
    if (url === '/' || url === '/docs' || url === '/docs/') {
      filePath = path.join(uiBuildDir, 'index.html');
    } else {
      // Strip /docs prefix if present
      const cleanUrl = url.startsWith('/docs/') ? url.slice(5) : url;
      filePath = path.join(uiBuildDir, cleanUrl.split('?')[0]);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const mime = getMimeType(filePath);

      // Inject live reload script into HTML
      if (mime === 'text/html') {
        let html = content.toString('utf-8');
        const reloadScript = `<script>
(function(){var es=new EventSource('/docs/__reload');es.onmessage=function(e){if(e.data==='reload')location.reload()};es.onerror=function(){es.close();setTimeout(function(){location.reload()},2000)}})();
</script>`;
        html = html.replace('</body>', reloadScript + '</body>');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(200, { 'Content-Type': mime });
        res.end(content);
      }
    } else {
      // SPA fallback - serve index.html
      const indexPath = path.join(uiBuildDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        const reloadScript = `<script>
(function(){var es=new EventSource('/docs/__reload');es.onmessage=function(e){if(e.data==='reload')location.reload()};es.onerror=function(){es.close();setTimeout(function(){location.reload()},2000)}})();
</script>`;
        html = html.replace('</body>', reloadScript + '</body>');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    }
  });

  server.listen(port, () => {
    printBanner();
    console.log(`  Dev server running!`);
    console.log('');
    console.log(`    Local:   http://localhost:${port}/docs`);
    console.log(`    API:     http://localhost:${port}/docs/api/data`);
    console.log('');
    console.log(`  Watching pepsdoc/ for changes...`);
    console.log(`  Press Ctrl+C to stop.`);
    console.log('');

    startWatching();
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`  Error: Port ${port} is already in use. Try --port=4001`);
    } else {
      console.error(`  Error: ${err.message}`);
    }
    process.exit(1);
  });
}

function printHelp(): void {
  printBanner();
  console.log('  Usage: npx pepsdoc <command>');
  console.log('');
  console.log('  Commands:');
  console.log('    init       Initialize pepsdoc/ folder in your project');
  console.log('    dev        Start dev server with live reload');
  console.log('    build      Compile documentation data into .build/');
  console.log('    export     Export docs (formats: llm, openapi)');
  console.log('    validate   Validate all JSON documentation files');
  console.log('    help       Show this message');
  console.log('');
  console.log('  Export formats:');
  console.log('    npx pepsdoc export llm          Markdown for AI');
  console.log('    npx pepsdoc export openapi       OpenAPI 3.0 JSON');
  console.log('    npx pepsdoc export openapi v2    OpenAPI for specific version');
  console.log('');
  console.log('  Dev options:');
  console.log('    --port=N   Port for dev server (default: 4000)');
  console.log('');
}

// --- Main ---
switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'dev':
    cmdDev();
    break;
  case 'build':
    cmdBuild();
    break;
  case 'export':
    cmdExport();
    break;
  case 'validate':
    cmdValidate();
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    printHelp();
    if (command) {
      console.error(`  Unknown command: ${command}`);
    }
    process.exit(command ? 1 : 0);
}
