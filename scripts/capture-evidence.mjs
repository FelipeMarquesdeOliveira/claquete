/**
 * Captura as telas do aplicativo em execução, para as evidências da entrega.
 *
 * Não são mockups: o Chrome abre o aplicativo servido pelo Expo e fotografa o
 * que está na tela, com os dados vindos do repositório configurado.
 *
 * Detalhe que custou caro para descobrir: o Chrome em modo headless tem largura
 * mínima de janela de 500px — pedir 390 devolve uma janela de 500, e a foto sai
 * mostrando só o pedaço esquerdo de um layout largo demais. Por isso o app é
 * carregado dentro de um iframe de 390px, que tem a largura real de um celular,
 * e a imagem é recortada nesse retângulo com o sips.
 *
 * Uso: npm run web        (em um terminal, deixe rodando)
 *      node scripts/capture-evidence.mjs
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'docs/evidencias');
const WORK = resolve(ROOT, '.evidence-build');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.CLAQUETE_URL ?? 'http://localhost:8081';

const TELA = { largura: 390, altura: 844 };
const JANELA = { largura: 520, altura: 900 }; // acima do mínimo do headless
const ESCALA = 2;

const TELAS = process.argv.slice(2).length
  ? process.argv.slice(2).map((par) => {
      const [rota, nome] = par.split('=');
      return { rota, nome };
    })
  : [
      { rota: '/', nome: '1-abertura' },
      { rota: '/clube', nome: '2-rodada-da-semana' },
      { rota: '/curadoria', nome: '3-vez-do-curador' },
      { rota: '/resultado', nome: '5-veredito' },
      { rota: '/estante', nome: '6-estante' },
      { rota: '/placar', nome: '7-placar' },
      { rota: '/perfil', nome: '8-perfil' },
    ];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function moldura(rota) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; height: ${JANELA.altura}px; background: #0E0E12; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; }
  iframe { width: ${TELA.largura}px; height: ${TELA.altura}px; border: 0; }
</style></head>
<body><iframe src="${BASE}${rota}"></iframe></body></html>`;
}

async function capturar(rota, destino) {
  const pagina = resolve(WORK, 'moldura.html');
  writeFileSync(pagina, moldura(rota));
  const bruto = resolve(WORK, 'bruto.png');
  rmSync(bruto, { force: true });

  const chrome = spawn(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      '--hide-scrollbars',
      `--force-device-scale-factor=${ESCALA}`,
      `--window-size=${JANELA.largura},${JANELA.altura}`,
      '--virtual-time-budget=20000',
      `--user-data-dir=${resolve(WORK, 'chrome')}`,
      `--screenshot=${bruto}`,
      `file://${pagina}`,
    ],
    { stdio: 'ignore' }
  );

  const limite = Date.now() + 90000;
  let anterior = -1;
  while (Date.now() < limite) {
    await sleep(700);
    if (!existsSync(bruto)) continue;
    const tamanho = statSync(bruto).size;
    if (tamanho > 0 && tamanho === anterior) break;
    anterior = tamanho;
  }
  chrome.kill('SIGKILL');
  if (!existsSync(bruto)) throw new Error(`falhou: ${rota}`);

  // recorta o retângulo do celular no centro da janela
  execFileSync('sips', [
    '-c',
    String(TELA.altura * ESCALA),
    String(TELA.largura * ESCALA),
    bruto,
    '--out',
    destino,
  ], { stdio: 'ignore' });
}

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

console.log(`Capturando o aplicativo em ${BASE}:`);
for (const { rota, nome } of TELAS) {
  const destino = resolve(OUT, `${nome}.png`);
  await capturar(rota, destino);
  console.log(`  ${nome}.png  ${(statSync(destino).size / 1024).toFixed(0)} KB`);
}
rmSync(WORK, { recursive: true, force: true });
console.log('Pronto.');
