/**
 * PepsDoc - API documentation, beautifully automated.
 *
 * Usage:
 * ```ts
 * import express from 'express';
 * import { pepsdoc } from 'pepsdoc';
 *
 * const app = express();
 * pepsdoc(app, { title: 'My API' });
 * app.listen(3000);
 * // Docs at http://localhost:3000/docs
 * ```
 */

import { expressAdapter } from './adapters/express';
import type { PepsDocConfig } from './core/schema';

// Main function — alias for Express adapter (default)
export function pepsdoc(app: unknown, config?: Partial<PepsDocConfig>): void {
  expressAdapter(app as Parameters<typeof expressAdapter>[0], config);
}

// Re-export everything
export { expressAdapter } from './adapters/express';
export { Storage } from './core/storage';
export { DEFAULT_CONFIG, METHOD_COLORS } from './core/config';
export { endpointToLLM, dataToLLM } from './export/llm';

// Re-export types
export type {
  PepsDocConfig,
  VersionConfig,
  TabConfig,
  ThemeConfig,
  HttpMethod,
  EndpointGroup,
  Endpoint,
  ParamField,
  RequestBody,
  ResponseDefinition,
  Note,
  PepsDocData,
  VersionData,
} from './core/schema';
