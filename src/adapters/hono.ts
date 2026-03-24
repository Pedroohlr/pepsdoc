/**
 * PepsDoc - Hono Adapter
 * Serve documentation as Hono middleware
 */

import * as path from 'path';
import * as fs from 'fs';
import { Storage } from '../core/storage';
import type { PepsDocConfig } from '../core/schema';
import { DEFAULT_CONFIG } from '../core/config';

interface HonoContext {
  json(data: unknown, status?: number): Response;
  html(html: string, status?: number): Response;
  text(text: string, status?: number): Response;
  body(body: string | ArrayBuffer | ReadableStream | null, status?: number): Response;
  header(name: string, value: string): void;
  req: {
    url: string;
    path: string;
  };
}

interface HonoApp {
  get(path: string, handler: (c: HonoContext) => Response | Promise<Response>): void;
}

/**
 * Initializes PepsDoc on a Hono app
 *
 * ```ts
 * import { Hono } from 'hono';
 * import { honoAdapter } from '@pepshlr/pepdoc';
 *
 * const app = new Hono();
 * honoAdapter(app, { title: 'My API' });
 * export default app;
 * ```
 */
export function honoAdapter(app: HonoApp, userConfig?: Partial<PepsDocConfig>): void {
  const config: PepsDocConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const basePath = config.basePath || '/docs';
  const projectRoot = process.cwd();
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    storage.init(config);
  }

  // API: compiled documentation data
  app.get(`${basePath}/api/data`, (c: HonoContext) => {
    try {
      const data = storage.compile();
      data.config = { ...data.config, ...config, theme: { ...data.config.theme, ...config.theme } };
      return c.json(data);
    } catch {
      return c.json({ error: 'Failed to compile documentation' }, 500);
    }
  });

  // Serve static UI
  const uiBuildDir = path.join(__dirname, '..', '..', 'ui', 'build');

  if (fs.existsSync(uiBuildDir)) {
    app.get(`${basePath}`, (c: HonoContext) => {
      const html = fs.readFileSync(path.join(uiBuildDir, 'index.html'), 'utf-8');
      return c.html(html);
    });

    app.get(`${basePath}/*`, (c: HonoContext) => {
      const reqPath = c.req.path;
      const relativePath = reqPath.replace(basePath, '').split('?')[0];
      const filePath = path.join(uiBuildDir, relativePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimes: Record<string, string> = {
          '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
          '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon', '.woff2': 'font/woff2',
        };
        c.header('Content-Type', mimes[ext] || 'application/octet-stream');
        return c.body(new Uint8Array(content).buffer as ArrayBuffer);
      } else {
        // SPA fallback
        const html = fs.readFileSync(path.join(uiBuildDir, 'index.html'), 'utf-8');
        return c.html(html);
      }
    });
  } else {
    app.get(`${basePath}`, (c: HonoContext) => {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head><title>${config.title} - PepsDoc</title>
        <style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff}.c{text-align:center;max-width:500px}code{background:#1a1a2e;padding:2px 8px;border-radius:4px;color:#818cf8}</style>
        </head>
        <body><div class="c">
        <h1>PepsDoc</h1>
        <p><strong>${config.title}</strong></p>
        <p>UI build not found. Run <code>npx pepsdoc build</code> to generate.</p>
        </div></body></html>
      `);
    });
  }
}
