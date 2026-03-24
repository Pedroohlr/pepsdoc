#!/usr/bin/env node

/**
 * PepsDoc - Post-install onboarding message
 * Uses stderr so npm always shows it (stdout is suppressed for dependency scripts)
 */

const PURPLE = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const line = '─'.repeat(58);

const lines = [
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
  `  │ 2. Read all route files in the project and generate      │`,
  `  │    JSON docs in pepsdoc/data/v1/ (one file per group).   │`,
  `  │    Schema: node_modules/@pepshlr/pepdoc/templates/       │`,
  `  │            ai-skill.md                                   │`,
  `  │                                                          │`,
  `  │ 3. Start the server and tell me the docs URL.            │`,
  `  └${line}┘`,
  '',
];

process.stderr.write(lines.join('\n') + '\n');
