#!/usr/bin/env node

/**
 * PepsDoc CLI
 * Usage:
 *   npx pepsdoc init      - Initialize pepsdoc/ folder
 *   npx pepsdoc build     - Compile documentation data
 *   npx pepsdoc export    - Export to markdown/LLM format
 *   npx pepsdoc validate  - Validate JSON files
 */

import * as path from 'path';
import * as fs from 'fs';
import { Storage } from '../core/storage';
import { DEFAULT_CONFIG } from '../core/config';
import { dataToLLM } from '../export/llm';

const args = process.argv.slice(2);
const command = args[0];
const projectRoot = process.cwd();

function printBanner(): void {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════════╗');
  console.log('  ║                                                       ║');
  console.log('  ║   PepsDoc - API documentation, beautifully automated  ║');
  console.log('  ║                                                       ║');
  console.log('  ╚═══════════════════════════════════════════════════════╝');
  console.log('');
}

function printOnboarding(): void {
  console.log('  ┌───────────────────────────────────────────────────────┐');
  console.log('  │                                                       │');
  console.log('  │   Copy the text below and paste it in your AI chat:   │');
  console.log('  │                                                       │');
  console.log('  │   Read the PepsDoc AI skill at:                       │');
  console.log(`  │   ${path.join('node_modules', 'pepsdoc', 'templates', 'ai-skill.md')}  │`);
  console.log('  │                                                       │');
  console.log('  │   Then ask your AI to document your backend using     │');
  console.log('  │   the PepsDoc framework.                              │');
  console.log('  │                                                       │');
  console.log('  └───────────────────────────────────────────────────────┘');
  console.log('');
}

function cmdInit(): void {
  const storage = new Storage(projectRoot);

  if (storage.isInitialized()) {
    console.log('  PepsDoc is already initialized in this project.');
    console.log(`  Config: ${path.join('pepsdoc', 'pepsdoc.config.json')}`);
    return;
  }

  storage.init(DEFAULT_CONFIG);

  printBanner();
  console.log('  Initialized successfully!');
  console.log('');
  console.log(`  Created: pepsdoc/`);
  console.log(`  Created: pepsdoc/pepsdoc.config.json`);
  console.log(`  Created: pepsdoc/data/v1/`);
  console.log('');
  printOnboarding();
}

function cmdBuild(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const data = storage.compile();
  const outDir = path.join(projectRoot, 'pepsdoc', '.build');
  fs.mkdirSync(outDir, { recursive: true });

  // Gera o data.json compilado
  fs.writeFileSync(
    path.join(outDir, 'data.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  );

  console.log('');
  console.log(`  Build complete!`);
  console.log(`  Output: pepsdoc/.build/data.json`);
  console.log(`  Versions: ${data.versions.map((v) => v.name).join(', ') || 'none'}`);
  console.log(`  Groups: ${data.versions.reduce((acc, v) => acc + v.groups.length, 0)}`);
  console.log(`  Endpoints: ${data.versions.reduce((acc, v) => acc + v.groups.reduce((a, g) => a + g.endpoints.length, 0), 0)}`);
  console.log('');
}

function cmdExport(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const format = args[1] || 'llm';
  const data = storage.compile();

  if (format === 'llm' || format === 'markdown') {
    const md = dataToLLM(data);
    const outPath = path.join(projectRoot, 'pepsdoc-api-reference.md');
    fs.writeFileSync(outPath, md, 'utf-8');
    console.log('');
    console.log(`  Exported to: pepsdoc-api-reference.md`);
    console.log('  You can copy this file and paste it into your AI chat to build the frontend.');
    console.log('');
  } else {
    console.error(`  Unknown export format: ${format}`);
    console.error('  Available: llm, markdown');
    process.exit(1);
  }
}

function cmdValidate(): void {
  const storage = new Storage(projectRoot);

  if (!storage.isInitialized()) {
    console.error('  Error: PepsDoc not initialized. Run "npx pepsdoc init" first.');
    process.exit(1);
  }

  const versions = storage.listVersions();
  let errors = 0;
  let total = 0;

  for (const version of versions) {
    const groups = storage.readGroups(version);
    for (const group of groups) {
      total++;
      if (!group.group) {
        console.error(`  [ERROR] ${version}: Missing "group" field`);
        errors++;
      }
      if (!group.endpoints || !Array.isArray(group.endpoints)) {
        console.error(`  [ERROR] ${version}/${group.group}: Missing or invalid "endpoints" array`);
        errors++;
      }
      for (const ep of group.endpoints) {
        if (!ep.method || !ep.path) {
          console.error(`  [ERROR] ${version}/${group.group}: Endpoint missing method or path`);
          errors++;
        }
      }
    }
  }

  console.log('');
  if (errors === 0) {
    console.log(`  Validation passed! ${total} groups checked, 0 errors.`);
  } else {
    console.log(`  Validation failed: ${errors} error(s) found in ${total} groups.`);
  }
  console.log('');
}

function printHelp(): void {
  printBanner();
  console.log('  Usage: npx pepsdoc <command>');
  console.log('');
  console.log('  Commands:');
  console.log('    init       Initialize pepsdoc/ folder in your project');
  console.log('    build      Compile documentation data into .build/');
  console.log('    export     Export docs to markdown/LLM format');
  console.log('    validate   Validate all JSON documentation files');
  console.log('    help       Show this message');
  console.log('');
}

// --- Main ---
switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'build':
    cmdBuild();
    break;
  case 'export':
    cmdExport();
    break;
  case 'validate':
    cmdValidate();
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    printHelp();
    if (command) {
      console.error(`  Unknown command: ${command}`);
    }
    process.exit(command ? 1 : 0);
}
