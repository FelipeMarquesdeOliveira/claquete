/**
 * Renders the Claquete pitch deck (scripts/deck/deck.html) as a PDF.
 *
 * The deck embeds the brand fonts and the rendered screens, so the build copies
 * every asset into a temporary folder next to the HTML before printing. Slides
 * are 1280x720 px, which prints as a 16:9 page.
 *
 * Usage: node scripts/build-pitch-deck.mjs
 */
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = resolve(ROOT, '.deck-build');
const OUT = resolve(ROOT, 'docs/deck/claquete-pitch-deck.pdf');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FONTS = {
  'bebas.ttf': 'bebas-neue/400Regular/BebasNeue_400Regular.ttf',
  'inter-regular.ttf': 'inter/400Regular/Inter_400Regular.ttf',
  'inter-medium.ttf': 'inter/500Medium/Inter_500Medium.ttf',
  'inter-bold.ttf': 'inter/700Bold/Inter_700Bold.ttf',
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function stage() {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  mkdirSync(dirname(OUT), { recursive: true });

  copyFileSync(resolve(ROOT, 'scripts/deck/deck.html'), resolve(WORK, 'deck.html'));
  copyFileSync(resolve(ROOT, 'scripts/deck/style.css'), resolve(WORK, 'style.css'));
  copyFileSync(resolve(ROOT, 'assets/brand/logo-mark.png'), resolve(WORK, 'logo-mark.png'));

  for (const [name, path] of Object.entries(FONTS)) {
    copyFileSync(resolve(ROOT, 'node_modules/@expo-google-fonts', path), resolve(WORK, name));
  }
  for (const pasta of ['docs/telas', 'docs/telas/mockups']) {
    for (const arquivo of readdirSync(resolve(ROOT, pasta))) {
      if (arquivo.endsWith('.png')) {
        copyFileSync(resolve(ROOT, pasta, arquivo), resolve(WORK, arquivo));
      }
    }
  }
}

/** Chrome writes the PDF quickly but stays alive, so wait for the file to settle. */
async function print() {
  rmSync(OUT, { force: true });
  const chrome = spawn(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-pdf-header-footer', '--virtual-time-budget=10000',
    `--user-data-dir=${resolve(WORK, 'chrome-profile')}`,
    `--print-to-pdf=${OUT}`, `file://${resolve(WORK, 'deck.html')}`,
  ], { stdio: 'ignore' });

  const deadline = Date.now() + 90000;
  let previousSize = -1;
  while (Date.now() < deadline) {
    await sleep(500);
    if (!existsSync(OUT)) continue;
    const size = statSync(OUT).size;
    if (size > 0 && size === previousSize) break;
    previousSize = size;
  }
  chrome.kill('SIGKILL');

  if (!existsSync(OUT)) throw new Error('Chrome nao gerou o deck.');
  console.log(`docs/deck/claquete-pitch-deck.pdf  ${(statSync(OUT).size / 1024).toFixed(0)} KB`);
}

stage();
await print();
rmSync(WORK, { recursive: true, force: true });
