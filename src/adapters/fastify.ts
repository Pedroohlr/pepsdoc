/**
 * PepsDoc - Fastify Adapter
 * Serve documentation as Fastify plugin
 */

import * as path from 'path';
import * as fs from 'fs';
import { Storage } from '../core/storage';
import type { PepsDocConfig } from '../core/schema';
import { DEFAULT_CONFIG } from '../core/config';

interface FastifyRequest {
  url: string;
  raw: { url?: string };
}

interface FastifyReply {
  type(contentType: string): this;
  code(statusCode: number): this;
  send(payload?: unknown): this;
  header(name: string, value: string): this;
}

interface FastifyInstance {
  get(path: string, handler: (request: FastifyRequest, reply: FastifyReply) => void | Promise<void>): void;
  register(plugin: Function, opts?: unknown): void;
}

/**
 * Initializes PepsDoc on a Fastify app
 *
 * ```ts
 * import Fastify from 'fastify';
 * import { fastifyAdapter } from '@pepshlr/pepdoc';
 *
 * const app = Fastify();
 * fastifyAdapter(app, { title: 'My API' });
 * app.listen({ port: 3000 });
 * ```
 */
export function fastifyAdapter(app: FastifyInstance, userConfig?: Partial<PepsDocConfig>): void {
  const config: PepsDocConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const basePath = config.basePath || '/docs';
  const projectRoot = process.cwd();
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    storage.init(config);
  }

  // API: compiled documentation data
  app.get(`${basePath}/api/data`, (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = storage.compile();
      data.config = { ...data.config, ...config, theme: { ...data.config.theme, ...config.theme } };
      reply.type('application/json').send(data);
    } catch {
      reply.code(500).send({ error: 'Failed to compile documentation' });
    }
  });

  // Serve static UI
  const uiBuildDir = path.join(__dirname, '..', '..', 'ui', 'build');

  if (fs.existsSync(uiBuildDir)) {
    app.get(`${basePath}`, (_request: FastifyRequest, reply: FastifyReply) => {
      const html = fs.readFileSync(path.join(uiBuildDir, 'index.html'), 'utf-8');
      reply.type('text/html').send(html);
    });

    app.get(`${basePath}/*`, (request: FastifyRequest, reply: FastifyReply) => {
      const reqUrl = request.raw.url || request.url;
      const relativePath = reqUrl.replace(basePath, '').split('?')[0];
      const filePath = path.join(uiBuildDir, relativePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimes: Record<string, string> = {
          '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
          '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon', '.woff2': 'font/woff2',
        };
        reply.type(mimes[ext] || 'application/octet-stream').send(content);
      } else {
        // SPA fallback
        const html = fs.readFileSync(path.join(uiBuildDir, 'index.html'), 'utf-8');
        reply.type('text/html').send(html);
      }
    });
  } else {
    app.get(`${basePath}`, (_request: FastifyRequest, reply: FastifyReply) => {
      reply.type('text/html').send(`
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
