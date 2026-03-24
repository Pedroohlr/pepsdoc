/**
 * PepsDoc - Express Adapter
 * Serve a documentação como middleware Express
 */

import * as path from 'path';
import * as fs from 'fs';
import { Storage } from '../core/storage';
import type { PepsDocConfig } from '../core/schema';
import { DEFAULT_CONFIG } from '../core/config';

interface ExpressApp {
  get(path: string, ...handlers: Function[]): void;
  use(path: string, ...handlers: Function[]): void;
}

interface ExpressRequest {
  path: string;
}

interface ExpressResponse {
  json(data: unknown): void;
  sendFile(filePath: string): void;
  type(contentType: string): this;
  send(body: string): void;
  status(code: number): this;
}

/**
 * Inicializa o PepsDoc num app Express
 *
 * ```ts
 * import express from 'express';
 * import { pepsdoc } from 'pepsdoc';
 *
 * const app = express();
 * pepsdoc(app, { title: 'Minha API' });
 * app.listen(3000);
 * ```
 */
export function expressAdapter(app: ExpressApp, userConfig?: Partial<PepsDocConfig>): void {
  const config: PepsDocConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const basePath = config.basePath || '/docs';
  const projectRoot = process.cwd();
  const storage = new Storage(projectRoot);

  // Inicializa a pasta pepsdoc/ se não existir
  if (!storage.isInitialized()) {
    storage.init(config);
  }

  // API: retorna os dados compilados
  app.get(`${basePath}/api/data`, (_req: ExpressRequest, res: ExpressResponse) => {
    try {
      const data = storage.compile();
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Failed to compile documentation' });
    }
  });

  // Serve a UI estática
  const uiBuildDir = path.join(__dirname, '..', 'ui', 'build');

  if (fs.existsSync(uiBuildDir)) {
    // Em produção: serve a build estática
    app.get(`${basePath}`, (_req: ExpressRequest, res: ExpressResponse) => {
      res.sendFile(path.join(uiBuildDir, 'index.html'));
    });

    app.get(`${basePath}/*`, (req: ExpressRequest, res: ExpressResponse) => {
      const filePath = path.join(uiBuildDir, req.path.replace(basePath, ''));
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        // SPA fallback
        res.sendFile(path.join(uiBuildDir, 'index.html'));
      }
    });
  } else {
    // Em dev: mostra mensagem placeholder
    app.get(`${basePath}`, (_req: ExpressRequest, res: ExpressResponse) => {
      res.type('html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${config.title} - PepsDoc</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
            .container { text-align: center; max-width: 500px; }
            h1 { font-size: 2rem; margin-bottom: 0.5rem; }
            p { color: #888; line-height: 1.6; }
            code { background: #1a1a2e; padding: 2px 8px; border-radius: 4px; color: #818cf8; }
            a { color: #818cf8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>PepsDoc</h1>
            <p><strong>${config.title}</strong></p>
            <p>Documentation UI is loading data from <code>${basePath}/api/data</code></p>
            <p>UI build not found. Run <code>npx pepsdoc build</code> to generate.</p>
          </div>
        </body>
        </html>
      `);
    });
  }
}
