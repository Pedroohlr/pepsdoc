#!/usr/bin/env node

/**
 * PepsDoc - Post-install onboarding
 * Writes directly to the terminal device (bypasses npm output buffering)
 * Also creates PEPSDOC.md in the project root as a fallback
 */

import * as fs from 'fs';
import * as path from 'path';

const PURPLE = '\x1b[35m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

const line = '─'.repeat(58);

const message = [
  '',
  `  ${PURPLE}${BOLD}✦ PepsDoc${RESET} installed!`,
  '',
  `  ${GREEN}${BOLD}Let AI document your entire API automatically.${RESET}`,
  `  ${DIM}Copy the prompt below and paste it into your AI assistant:${RESET}`,
  '',
  `  ┌${line}┐`,
  `  │ ${YELLOW}pepsdoc: integrate and document my entire API            ${RESET} │`,
  `  │                                                          │`,
  `  │ @pepshlr/pepdoc is already installed. Do the following:  │`,
  `  │                                                          │`,
  `  │ 1. Find my main server file and add the adapter:         │`,
  `  │    Express → pepsdoc(app, { title: '...' })              │`,
  `  │    Fastify → fastifyAdapter(app, { title: '...' })       │`,
  `  │    Hono    → honoAdapter(app, { title: '...' })          │`,
  `  │                                                          │`,
  `  │ 2. Read all route files and generate JSON docs           │`,
  `  │    in pepsdoc/data/v1/ (one file per group).             │`,
  `  │    Schema: node_modules/@pepshlr/pepdoc/templates/       │`,
  `  │            ai-skill.md                                   │`,
  `  │                                                          │`,
  `  │ 3. Start the server and tell me the docs URL.            │`,
  `  └${line}┘`,
  `  ${DIM}(full prompt also saved to PEPSDOC.md in your project)${RESET}`,
  '',
].join('\n');

// Write directly to the terminal device — bypasses npm's output buffering
function writeToTerminal(text: string): void {
  const ttyDevice = process.platform === 'win32' ? '\\\\.\\CON' : '/dev/tty';
  try {
    const fd = fs.openSync(ttyDevice, 'w');
    fs.writeSync(fd, text);
    fs.closeSync(fd);
  } catch {
    // If TTY device isn't available, fall back to stderr
    try { process.stderr.write(text); } catch { /* ignore */ }
  }
}

writeToTerminal(message);

// Also create PEPSDOC.md in the project root for easy copy-paste in VS Code
const projectRoot = process.env.INIT_CWD || process.cwd();
const outputFile = path.join(projectRoot, 'PEPSDOC.md');

const fileContent = `# PepsDoc is ready!

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
  fs.writeFileSync(outputFile, fileContent);
} catch {
  // Silently ignore — don't break the install
}
