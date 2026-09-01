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
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = resolve(ROOT, '.pdf-build');
const OUT = resolve(ROOT, 'docs');

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DOCS = [
  { file: 'docs/markdown/01-escopo.md', out: '01-escopo.pdf', label: 'Checkpoint 4 · Documento de escopo' },
  { file: 'docs/markdown/02-marca.md', out: '02-marca.pdf', label: 'Checkpoint 4 · Manual da marca' },
  { file: 'docs/markdown/03-pitch.md', out: '03-pitch.pdf', label: 'Checkpoint 4 · Pitch e modelo de negócio' },
  { file: 'docs/markdown/04-telas.md', out: '04-telas.pdf', label: 'Checkpoint 4 · Telas conceituais' },
  { file: 'docs/markdown/05-equipe.md', out: '05-equipe.pdf', label: 'Checkpoint 4 · Equipe e papéis' },
];

const FOOTER =
  'Felipe Marques (RM556319) · Gabriel Barros Cisoto (RM556309)';

const LOGO = `<svg width="58" height="58" viewBox="0 0 200 200">
  <defs>
    <clipPath id="bloco"><rect width="200" height="200" rx="46" ry="46"/></clipPath>
    <mask id="corte">
      <rect width="200" height="200" fill="#fff"/>
      <rect x="-70" y="79" width="340" height="18" fill="#000" transform="rotate(-12 100 88)"/>
    </mask>
  </defs>
  <g clip-path="url(#bloco)" mask="url(#corte)">
    <rect width="200" height="200" fill="#FFC53D"/>
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

/** Resolve caminhos de imagem contra a pasta do Markdown, para o Chrome achar. */
function comImagensAbsolutas(html, pasta) {
  // pathToFileURL codifica espaços e parênteses do caminho; sem isso o Chrome
  // simplesmente não carrega a imagem e o documento sai com buracos.
  return html.replace(
    /src="(?!https?:|file:|data:)([^"]+)"/g,
    (_, caminho) => `src="${pathToFileURL(resolve(pasta, caminho)).href}"`
  );
}

/**
 * O Chrome nao renderiza mermaid. Em vez de imprimir o codigo do diagrama,
 * traduz as setas do fluxo em uma sequencia legivel.
 */
function fluxoLegivel(html) {
  return html.replace(/<pre class="mermaid"><code>([\s\S]*?)<\/code><\/pre>/g, (_, codigo) => {
    const texto = codigo.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const rotulos = {};
    for (const [, id, rotulo] of texto.matchAll(/(\w+)\[([^\]]+)\]/g)) rotulos[id] = rotulo;

    const passos = [];
    for (const [, de, condicao, para] of texto.matchAll(/(\w+)\s*--+>(?:\|([^|]*)\|)?\s*(\w+)/g)) {
      passos.push({
        de: rotulos[de] || de,
        para: rotulos[para] || para,
        condicao: (condicao || '').trim(),
      });
    }
    if (!passos.length) return '';

    const linhas = passos.map((p) =>
      `<tr><td>${p.de}</td><td class="seta">&rarr;</td><td>${p.para}</td>` +
      `<td class="condicao">${p.condicao ? p.condicao : ''}</td></tr>`
    ).join('');
    return `<table class="fluxo"><thead><tr><th>De</th><th></th><th>Para</th><th>Quando</th></tr></thead><tbody>${linhas}</tbody></table>`;
  });
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
  const corpo = comImagensAbsolutas(fluxoLegivel(addColorChips(body)), dirname(resolve(ROOT, doc.file)));
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
${corpo}
<footer class="doc-footer"><span>Claquete · ${doc.label}</span><span>${FOOTER}</span></footer>
</body>
</html>`;

  const htmlPath = resolve(WORK, doc.out.replace(/\.pdf$/, '.html'));
  writeFileSync(htmlPath, page);

  await printPdf(htmlPath, resolve(OUT, doc.out));
  console.log(`  docs/${doc.out}`);
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
