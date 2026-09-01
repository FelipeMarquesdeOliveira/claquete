/**
 * Exporta o pitch deck em outros formatos, a partir do PDF já montado:
 *
 *   docs/pitch-deck/claquete-pitch-deck.pdf    (fonte, gerada por build-pitch-deck.mjs)
 *   docs/pitch-deck/claquete-pitch-deck.pptx   PowerPoint / Google Slides / Keynote
 *   docs/pitch-deck/slides/slide-NN.png        um arquivo por slide
 *
 * Cada slide entra no PPTX como imagem de página inteira: o arquivo abre em
 * qualquer editor e projeta idêntico ao PDF, sem depender das fontes da marca
 * estarem instaladas na máquina de quem apresenta.
 *
 * Uso: node scripts/build-deck-formats.mjs
 * Requer: pdftoppm (Poppler) e pptxgenjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pptxgen from 'pptxgenjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = resolve(ROOT, 'docs/pitch-deck/claquete-pitch-deck.pdf');
const SLIDES = resolve(ROOT, 'docs/pitch-deck/slides');
const PPTX = resolve(ROOT, 'docs/pitch-deck/claquete-pitch-deck.pptx');

// o slide é desenhado em 1280 x 720 px, que a 96 dpi dá 13,333 x 7,5 polegadas
const LARGURA = 13.333;
const ALTURA = 7.5;

console.log('Exportando o deck em outros formatos:');

rmSync(SLIDES, { recursive: true, force: true });
mkdirSync(SLIDES, { recursive: true });

// 120 dpi = 1600 x 900 px por slide: nítido em projeção sem inchar o arquivo
execFileSync('pdftoppm', ['-png', '-r', '120', PDF, resolve(SLIDES, 'slide')]);

const imagens = readdirSync(SLIDES).filter((f) => f.endsWith('.png')).sort();
for (const imagem of imagens) {
  console.log(`  slides/${imagem}  ${(statSync(resolve(SLIDES, imagem)).size / 1024).toFixed(0)} KB`);
}

const pres = new pptxgen();
pres.defineLayout({ name: 'CLAQUETE', width: LARGURA, height: ALTURA });
pres.layout = 'CLAQUETE';
pres.author = 'Felipe Marques e Gabriel Barros Cisoto';
pres.company = 'FIAP · Mobile Development & IoT';
pres.title = 'Claquete · Pitch';
pres.subject = 'Checkpoint 4 — Idealização';

for (const imagem of imagens) {
  const slide = pres.addSlide();
  slide.background = { color: '0E0E12' };
  slide.addImage({ path: resolve(SLIDES, imagem), x: 0, y: 0, w: LARGURA, h: ALTURA });
}

await pres.writeFile({ fileName: PPTX });
console.log(`  claquete-pitch-deck.pptx  ${(statSync(PPTX).size / 1024).toFixed(0)} KB  (${imagens.length} slides)`);
console.log('Pronto.');
