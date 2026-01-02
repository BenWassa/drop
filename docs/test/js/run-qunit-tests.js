#!/usr/bin/env node

/**
 * Simple Node.js test runner for drop
 * Validates test file structure and reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`
╔════════════════════════════════════════════╗
║   drop QUnit Test Suite                    ║
╚════════════════════════════════════════════╝
`);

const testFile = path.resolve(__dirname, '../js/dom.test.js');

try {
  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(testFile, 'utf-8');
  
  // Count test structure
  const modules = (content.match(/QUnit\.module\(/g) || []).length;
  const tests = (content.match(/QUnit\.test\(/g) || []).length;
  const assertions = (content.match(/assert\./g) || []).length;

  console.log(`📖 Loading tests...\n`);
  
  // Validate test file structure
  const hasValidStructure = content.includes('QUnit.module') && 
                           content.includes('QUnit.test') && 
                           content.includes('assert.');

  if (!hasValidStructure) {
    console.error('❌ Test file has invalid structure');
    process.exit(1);
  }

  // Print results
  console.log(`📊 Test Suite:\n`);
  console.log(`   Test Modules:  ${modules}`);
  console.log(`   Test Cases:    ${tests}`);
  console.log(`   Assertions:    ${assertions}\n`);
  
  console.log(`✅ Test suite is valid and ready to run!\n`);
  console.log(`💡 To run tests in browser:`);
  console.log(`   open test/pages/index.html\n`);

  process.exit(0);

} catch (error) {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
}
