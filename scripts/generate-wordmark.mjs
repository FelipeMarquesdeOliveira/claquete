/**
 * Renders the Claquete wordmark - the name sliced by the brand's diagonal cut -
 * as a transparent PNG, so the app and the documents use the exact lettering
 * instead of re-typing it. Needs Google Chrome and the Bebas Neue font that
 * ships with @expo-google-fonts.
 *
 * Usage: node scripts/generate-wordmark.mjs
 */
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = resolve(ROOT, '.brand-build');
const OUT = resolve(ROOT, 'assets/brand/wordmark.png');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
copyFileSync(resolve(ROOT, 'scripts/brand/wordmark.html'), resolve(WORK, 'wordmark.html'));
copyFileSync(
  resolve(ROOT, 'node_modules/@expo-google-fonts/bebas-neue/400Regular/BebasNeue_400Regular.ttf'),
  resolve(WORK, 'bebas.ttf')
);

rmSync(OUT, { force: true });
const chrome = spawn(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--hide-scrollbars',
  '--default-background-color=00000000',
  '--window-size=940,290', '--virtual-time-budget=6000',
  `--user-data-dir=${resolve(WORK, 'chrome-profile')}`,
  `--screenshot=${OUT}`, `file://${resolve(WORK, 'wordmark.html')}`,
], { stdio: 'ignore' });

const deadline = Date.now() + 60000;
let previousSize = -1;
while (Date.now() < deadline) {
  await sleep(400);
  if (!existsSync(OUT)) continue;
  const size = statSync(OUT).size;
  if (size > 0 && size === previousSize) break;
  previousSize = size;
}
chrome.kill('SIGKILL');
rmSync(WORK, { recursive: true, force: true });

if (!existsSync(OUT)) throw new Error('Chrome nao gerou o wordmark.');
console.log(`assets/brand/wordmark.png  ${(statSync(OUT).size / 1024).toFixed(0)} KB`);
