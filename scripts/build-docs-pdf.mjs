/**
 * Renders the Markdown documents under docs/ as branded PDFs.
 *
 * Pipeline: Markdown --(pandoc)--> HTML fragment --(brand template)--> HTML
 * --(headless Chrome)--> PDF. The Markdown files stay the single source of
 * truth; the PDFs are a generated output, never edited by hand.
 *
 * Usage: node scripts/build-docs-pdf.mjs [doc-name ...]
 *        node scripts/build-docs-pdf.mjs               # every document below
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = resolve(ROOT, '.pdf-build');
const OUT = resolve(ROOT, 'docs/pdf');

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DOCS = [
  { file: 'docs/01-escopo.md', out: 'claquete-escopo.pdf', label: 'Checkpoint 4 · Documento de escopo' },
  { file: 'docs/02-marca.md', out: 'claquete-marca.pdf', label: 'Checkpoint 4 · Manual da marca' },
  { file: 'docs/03-pitch.md', out: 'claquete-pitch.pdf', label: 'Checkpoint 4 · Pitch e modelo de negócio' },
  { file: 'docs/04-telas.md', out: 'claquete-telas.pdf', label: 'Checkpoint 4 · Telas conceituais' },
  { file: 'docs/05-equipe.md', out: 'claquete-equipe.pdf', label: 'Checkpoint 4 · Equipe e papéis' },
];

const FOOTER =
  'Felipe Marques (RM556319) · Gabriel Barros Cisoto (RM556309)';

const LOGO = `<svg width="58" height="58" viewBox="0 0 256 256">
  <defs><clipPath id="mark"><rect width="256" height="256" rx="56"/></clipPath></defs>
  <g clip-path="url(#mark)">
    <rect width="256" height="256" fill="#1A1A21"/>
    <rect width="256" height="80" fill="#FFC53D"/>
    <g fill="#0E0E12">
      <rect x="14" y="-24" width="28" height="130" transform="rotate(20 28 40)"/>
      <rect x="86" y="-24" width="28" height="130" transform="rotate(20 100 40)"/>
      <rect x="158" y="-24" width="28" height="130" transform="rotate(20 172 40)"/>
      <rect x="230" y="-24" width="28" height="130" transform="rotate(20 244 40)"/>
    </g>
    <rect x="72" y="168" width="30" height="42" rx="8" fill="#3A3A46"/>
    <rect x="114" y="128" width="30" height="82" rx="8" fill="#FFC53D"/>
    <rect x="156" y="150" width="30" height="60" rx="8" fill="#3A3A46"/>
  </g>
</svg>`;

function prepareWorkspace() {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  mkdirSync(OUT, { recursive: true });

  copyFileSync(resolve(ROOT, 'scripts/pdf/style.css'), resolve(WORK, 'style.css'));

  const fonts = {
    'bebas.ttf': 'bebas-neue/400Regular/BebasNeue_400Regular.ttf',
    'inter-regular.ttf': 'inter/400Regular/Inter_400Regular.ttf',
    'inter-medium.ttf': 'inter/500Medium/Inter_500Medium.ttf',
    'inter-bold.ttf': 'inter/700Bold/Inter_700Bold.ttf',
  };
  for (const [name, path] of Object.entries(fonts)) {
    copyFileSync(
      resolve(ROOT, 'node_modules/@expo-google-fonts', path),
      resolve(WORK, name)
    );
  }
}

/** Pulls the first <h1> out of the body and returns it as the page title. */
function extractTitle(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!match) return { title: 'Claquete', body: html };
  const title = match[1].replace(/<[^>]+>/g, '').replace(/^\d+\s*·\s*/, '');
  return { title, body: html.replace(match[0], '') };
}

/** Puts a color swatch in front of every hex code so the palette reads at a glance. */
function addColorChips(html) {
  return html.replace(
    /<code>#([0-9A-Fa-f]{6})<\/code>/g,
    (_, hex) => `<span class="chip" style="background:#${hex}"></span><code>#${hex}</code>`
  );
}

async function render(doc) {
  const fragment = execFileSync(
    'pandoc',
    [resolve(ROOT, doc.file), '-f', 'gfm', '-t', 'html5', '--syntax-highlighting=none'],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );

  const { title, body } = extractTitle(fragment);
  const page = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="doc-header">
  ${LOGO}
  <div>
    <div class="meta">${doc.label}</div>
    <div class="title">${title}</div>
    <div class="sub">FIAP · Mobile Development &amp; IoT · Engenharia de Software</div>
  </div>
</header>
${addColorChips(body)}
<footer class="doc-footer"><span>Claquete · ${doc.label}</span><span>${FOOTER}</span></footer>
</body>
</html>`;

  const htmlPath = resolve(WORK, doc.out.replace(/\.pdf$/, '.html'));
  writeFileSync(htmlPath, page);

  await printPdf(htmlPath, resolve(OUT, doc.out));
  console.log(`  docs/pdf/${doc.out}`);
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/**
 * Headless Chrome writes the PDF within a second but keeps the process alive,
 * so we wait for the file to stop growing and then shut the browser down.
 */
async function printPdf(htmlPath, pdfPath) {
  rmSync(pdfPath, { force: true });

  const chrome = spawn(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-pdf-header-footer',
      '--virtual-time-budget=8000',
      `--user-data-dir=${resolve(WORK, 'chrome-profile')}`,
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' }
  );

  const deadline = Date.now() + 90000;
  let previousSize = -1;

  while (Date.now() < deadline) {
    await sleep(500);
    if (!existsSync(pdfPath)) continue;
    const size = statSync(pdfPath).size;
    if (size > 0 && size === previousSize) break;
    previousSize = size;
  }

  chrome.kill('SIGKILL');

  if (!existsSync(pdfPath) || statSync(pdfPath).size === 0) {
    throw new Error(`Chrome nao gerou o PDF: ${pdfPath}`);
  }
}

const wanted = process.argv.slice(2);
const selected = wanted.length
  ? DOCS.filter((d) => wanted.some((w) => d.file.includes(w) || d.out.includes(w)))
  : DOCS;

if (!selected.length) {
  console.error('Nenhum documento corresponde ao filtro.');
  process.exit(1);
}

console.log('Gerando PDFs da documentação:');
prepareWorkspace();
for (const doc of selected) await render(doc);
rmSync(WORK, { recursive: true, force: true });
console.log('Pronto.');
