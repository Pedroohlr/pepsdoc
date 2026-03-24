/**
 * PepsDoc - Config defaults
 */

import type { PepsDocConfig } from './schema';

export const DEFAULT_CONFIG: PepsDocConfig = {
  title: 'My API',
  description: 'API Documentation powered by PepsDoc',
  basePath: '/docs',
  versions: [
    {
      name: 'v1',
      badge: 'stable',
      badgeColor: 'green',
      default: true,
    },
  ],
};

export const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280',
};
