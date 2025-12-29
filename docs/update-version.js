// Script to update manifest.json and package.json versions from version.js
import { APP_VERSION } from './version.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.join(__dirname, 'manifest.json');
const packagePath = path.join(__dirname, 'package.json');

function updateManifest() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = APP_VERSION;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Updated manifest.json version to', APP_VERSION);
}

function updatePackage() {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.version = APP_VERSION;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('Updated package.json version to', APP_VERSION);
}

updateManifest();
updatePackage();