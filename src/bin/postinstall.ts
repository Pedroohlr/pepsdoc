#!/usr/bin/env node

/**
 * PepsDoc - Post-install onboarding message
 * Shows a welcome message after npm install
 */

const PURPLE = '\x1b[35m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log('');
console.log(`  ${PURPLE}${BOLD}PepsDoc${RESET} installed successfully!`);
console.log('');
console.log(`  ${CYAN}Quick start:${RESET}`);
console.log(`    1. npx pepsdoc init`);
console.log(`    2. Add endpoints to pepsdoc/data/v1/`);
console.log(`    3. npx pepsdoc dev`);
console.log('');
console.log(`  ${DIM}Or let AI do the work — copy the AI Skill from:${RESET}`);
console.log(`  ${DIM}node_modules/@pepshlr/pepdoc/templates/ai-skill.md${RESET}`);
console.log('');
