#!/usr/bin/env node

/**
 * PepsDoc - Post-install onboarding
 * Creates PEPSDOC.md in the user's project root so it appears in VS Code
 */

import * as fs from 'fs';
import * as path from 'path';

// INIT_CWD = the directory where the user ran `npm install`
const projectRoot = process.env.INIT_CWD || process.cwd();
const outputFile = path.join(projectRoot, 'PEPSDOC.md');

// Don't run inside the pepsdoc package itself
if (projectRoot.includes('pepsdoc') && !process.env.INIT_CWD) {
  process.exit(0);
}

const content = `# PepsDoc is ready!

Paste the prompt below into your AI assistant and it will set everything up automatically:

---

\`\`\`
@pepshlr/pepdoc is already installed. Do the following:

1. Find my main server file and add the adapter:
   - Express  → const { pepsdoc } = require('@pepshlr/pepdoc'); pepsdoc(app, { title: 'My API' })
   - Fastify  → const { fastifyAdapter } = require('@pepshlr/pepdoc'); fastifyAdapter(app, { title: 'My API' })
   - Hono     → const { honoAdapter } = require('@pepshlr/pepdoc'); honoAdapter(app, { title: 'My API' })

2. Read all route files in the project and generate JSON documentation
   files in pepsdoc/data/v1/ (one file per group of routes).
   Follow the schema in: node_modules/@pepshlr/pepdoc/templates/ai-skill.md

3. Start the server and tell me the URL to access the docs.
\`\`\`

---

You can delete this file after setting up.
`;

try {
  fs.writeFileSync(outputFile, content);
} catch {
  // Silently ignore — don't break the install
}
