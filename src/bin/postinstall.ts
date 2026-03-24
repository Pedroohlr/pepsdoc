#!/usr/bin/env node

/**
 * PepsDoc - Post-install onboarding message
 * Shows a welcome message after npm install
 */

const PURPLE = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const line = '─'.repeat(58);

console.log('');
console.log(`  ${PURPLE}${BOLD}✦ PepsDoc${RESET} installed!`);
console.log('');
console.log(`  ${GREEN}${BOLD}Let AI document your entire API automatically.${RESET}`);
console.log(`  ${DIM}Copy the prompt below and paste it into your AI assistant:${RESET}`);
console.log('');
console.log(`  ┌${line}┐`);
console.log(`  │ ${YELLOW}pepsdoc: integrate and document my entire API            ${RESET} │`);
console.log(`  │                                                          │`);
console.log(`  │ @pepshlr/pepdoc is already installed. Do the following:  │`);
console.log(`  │                                                          │`);
console.log(`  │ 1. Find my main server file and add the adapter:         │`);
console.log(`  │    Express → pepsdoc(app, { title: '...' })              │`);
console.log(`  │    Fastify → fastifyAdapter(app, { title: '...' })       │`);
console.log(`  │    Hono    → honoAdapter(app, { title: '...' })          │`);
console.log(`  │                                                          │`);
console.log(`  │ 2. Read all route files in the project and generate      │`);
console.log(`  │    JSON docs in pepsdoc/data/v1/ (one file per group).   │`);
console.log(`  │    Schema: node_modules/@pepshlr/pepdoc/templates/       │`);
console.log(`  │            ai-skill.md                                   │`);
console.log(`  │                                                          │`);
console.log(`  │ 3. Start the server and tell me the docs URL.            │`);
console.log(`  └${line}┘`);
console.log('');
