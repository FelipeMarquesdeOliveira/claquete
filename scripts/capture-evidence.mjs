/**
 * Percorre a demonstração do Claquete e fotografa cada tela, para as evidências
 * da entrega.
 *
 * Não são mockups: o Chrome abre o aplicativo servido pelo Expo, toca nos
 * botões como um usuário tocaria e fotografa o que aparece — com os dados
 * vindos do repositório configurado, hoje o Supabase. O roteiro abaixo é a
 * mesma sequência que a apresentação segue: escolher o filme, confirmar
 * presença, votar e ver o veredito.
 *
 * Duas armadilhas custaram caro aqui, e é por isso que o script fala com o
 * Chrome pelo DevTools Protocol em vez de usar a flag `--screenshot`:
 *
 * 1. O Chrome headless tem largura mínima de janela de 500px. Pedir 390 devolve
 *    uma janela de 500 e a foto sai com um layout largo demais. O protocolo
 *    resolve isso de frente, com `Emulation.setDeviceMetricsOverride`: a
 *    viewport passa a ser 390x844 de verdade, sem iframe e sem recorte.
 *
 * 2. `--screenshot` dispara quando a página carrega, e com o banco ligado os
 *    dados ainda estão vindo pela rede nesse instante — as telas saíam pretas,
 *    porque elas renderizam `null` enquanto o clube não chegou. Agora o script
 *    espera a tela ter conteúdo, as fontes carregarem e os pôsteres
 *    terminarem, e só então fotografa.
 *
 * O roteiro começa e termina reiniciando a demonstração, então rodar o script
 * não deixa o banco no meio do caminho.
 *
 * Uso: npm run web        (em um terminal, deixe rodando)
 *      node scripts/capture-evidence.mjs
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'docs/evidencias');
// o perfil do Chrome fica fora do repositório: uma execução interrompida deixa
// arquivos para trás, e eles não podem atrapalhar a próxima nem sujar o projeto
const WORK = mkdtempSync(join(tmpdir(), 'claquete-evidencias-'));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.CLAQUETE_URL ?? 'http://localhost:8081';

const TELA = { largura: 390, altura: 844, escala: 2 };
const PORTA = 9333;

const tocar = (alvo) => ({ tipo: 'tocar', alvo });
const digitar = (campo, texto) => ({ tipo: 'digitar', campo, texto });

/**
 * O roteiro da demonstração.
 *
 * Cada passo abre uma rota, executa as ações e — quando tem `nome` — fotografa.
 * Passos sem `nome` existem só para levar os dados ao estado da tela seguinte.
 */
const ROTEIRO = [
  { rota: '/perfil', acoes: [tocar('Reiniciar demonstração')] },

  { rota: '/', nome: '1-abertura' },
  { rota: '/clube', nome: '2-rodada-da-semana' },

  // O curador buscando o filme da semana, com um já escolhido.
  {
    rota: '/curadoria',
    acoes: [digitar('Buscar filme', 'cida'), tocar({ primeiroFilme: true })],
    nome: '3-vez-do-curador',
  },

  // A sessão aconteceu: o clube confirma presença e abre a votação.
  { rota: '/clube', acoes: [tocar('Confirmar presença'), tocar('Já assistimos')] },
  { rota: '/clube', nome: '2b-rodada-em-votacao' },

  {
    rota: '/votacao',
    acoes: [tocar({ rotulo: 'Nota 8' }), digitar('Sua resenha', 'Já tinha visto e valeu de novo')],
    nome: '4-votacao',
  },

  // Com o último voto dentro, as notas são reveladas e a rodada fecha.
  {
    rota: '/votacao',
    acoes: [
      tocar({ rotulo: 'Nota 8' }),
      digitar('Sua resenha', 'Já tinha visto e valeu de novo'),
      tocar('Enviar minha nota'),
    ],
  },
  { rota: '/resultado', nome: '5-veredito' },

  { rota: '/estante', nome: '6-estante' },
  { rota: '/placar', nome: '7-placar' },
  { rota: '/perfil', nome: '8-perfil' },

  { rota: '/perfil', acoes: [tocar('Reiniciar demonstração')] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera o Chrome subir e devolve o endereço do canal de depuração. */
async function esperarChrome() {
  const limite = Date.now() + 30000;
  while (Date.now() < limite) {
    try {
      const resposta = await fetch(`http://127.0.0.1:${PORTA}/json/version`);
      const { webSocketDebuggerUrl } = await resposta.json();
      if (webSocketDebuggerUrl) return webSocketDebuggerUrl;
    } catch {
      // ainda subindo
    }
    await sleep(200);
  }
  throw new Error('O Chrome não abriu o canal de depuração.');
}

/** Cliente mínimo do DevTools Protocol: manda comando, espera a resposta. */
function conectar(endereco) {
  const socket = new WebSocket(endereco);
  const pendentes = new Map();
  let proximoId = 0;

  const pronto = new Promise((ok, falha) => {
    socket.addEventListener('open', () => ok());
    socket.addEventListener('error', () => falha(new Error('Falha no canal do Chrome.')));
  });

  socket.addEventListener('message', (evento) => {
    const mensagem = JSON.parse(evento.data);
    const pendente = pendentes.get(mensagem.id);
    if (!pendente) return;
    pendentes.delete(mensagem.id);
    if (mensagem.error) pendente.falha(new Error(mensagem.error.message));
    else pendente.ok(mensagem.result);
  });

  return {
    pronto,
    enviar(metodo, params = {}, sessionId) {
      const id = ++proximoId;
      return new Promise((ok, falha) => {
        pendentes.set(id, { ok, falha });
        socket.send(JSON.stringify({ id, method: metodo, params, sessionId }));
      });
    },
    fechar: () => socket.close(),
  };
}

/**
 * Conta as requisições em voo dentro da página.
 *
 * Cada toque dispara escritas no banco. Sem esperar por elas, o roteiro
 * navegava para a próxima tela no meio do caminho e abortava o que estava
 * viajando — foi assim que o "Reiniciar demonstração" chegou a apagar as
 * rodadas sem recriá-las.
 */
const CONTADOR = `
  window.__pendentes = 0;
  const original = window.fetch;
  window.fetch = function (...args) {
    window.__pendentes += 1;
    return original.apply(this, args).finally(() => { window.__pendentes -= 1; });
  };
`;

/**
 * A tela está pronta quando é a rota pedida, tem texto, as fontes carregaram e
 * nenhuma imagem ficou pendente.
 *
 * Conferir a rota não é preciosismo: logo depois de `Page.navigate` a tela
 * anterior ainda está desenhada e passaria em todos os outros testes — o script
 * então tocava em botões da tela errada e reclamava que não os encontrava.
 */
function pronta(rota) {
  return `(async () => {
    if (document.readyState !== 'complete') return null;
    if (location.pathname !== ${JSON.stringify(rota)}) return null;
    if ((window.__pendentes ?? 0) > 0) return null;
    await document.fonts.ready;
    const imagens = Array.from(document.images);
    if (!imagens.every((img) => img.complete && img.naturalWidth > 0)) return null;
    return (document.body?.innerText ?? '').trim();
  })()`;
}

/**
 * Onde tocar. O alvo pode ser o texto do botão, um rótulo de acessibilidade ou
 * o primeiro filme da lista de resultados — que não tem texto fixo.
 *
 * A expressão rola o elemento para dentro da tela antes de medir: numa viewport
 * de celular boa parte dos botões nasce abaixo da dobra, e um toque medido fora
 * dela não acerta nada — foi assim que o "Reiniciar demonstração" passou batido.
 */
function localizador(alvo) {
  const busca =
    typeof alvo === 'string'
      ? `Array.from(document.querySelectorAll('[role="button"]')).find(
           (el) => el.innerText.trim() === ${JSON.stringify(alvo)}
         )`
      : alvo.rotulo
        ? `document.querySelector('[aria-label=${JSON.stringify(alvo.rotulo)}]')`
        : `(() => {
             const campo = document.querySelector('input[aria-label="Buscar filme"]');
             if (!campo) return null;
             const limite = campo.getBoundingClientRect().bottom;
             return Array.from(document.querySelectorAll('[role="button"]'))
               .filter((el) => el.getBoundingClientRect().top > limite)
               .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
           })()`;

  return `(async () => {
    const alvo = ${busca};
    if (!alvo) return null;
    alvo.scrollIntoView({ block: 'center' });
    await new Promise((pronto) => requestAnimationFrame(() => requestAnimationFrame(pronto)));
    const r = alvo.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`;
}

async function avaliar(cdp, sessao, expressao) {
  const { result } = await cdp.enviar(
    'Runtime.evaluate',
    { expression: expressao, awaitPromise: true, returnByValue: true },
    sessao
  );
  return result?.value;
}

async function esperarPronta(cdp, sessao, rota) {
  const limite = Date.now() + 45000;
  let anterior = null;
  while (Date.now() < limite) {
    await sleep(400);
    const texto = await avaliar(cdp, sessao, pronta(rota));
    if (typeof texto !== 'string' || texto.length < 40) continue;
    // duas leituras iguais: a tela parou de mudar, os dados já chegaram
    if (texto === anterior) return;
    anterior = texto;
  }
  throw new Error(`a tela ${rota} não terminou de renderizar`);
}

async function executar(cdp, sessao, acao) {
  if (acao.tipo === 'tocar') {
    const ponto = await avaliar(cdp, sessao, localizador(acao.alvo));
    if (!ponto) throw new Error(`não encontrei o que tocar: ${JSON.stringify(acao.alvo)}`);
    for (const type of ['mousePressed', 'mouseReleased']) {
      await cdp.enviar(
        'Input.dispatchMouseEvent',
        { type, x: ponto.x, y: ponto.y, button: 'left', clickCount: 1 },
        sessao
      );
    }
  }

  if (acao.tipo === 'digitar') {
    const ponto = await avaliar(cdp, sessao, localizador({ rotulo: acao.campo }));
    if (!ponto) throw new Error(`não encontrei o campo: ${acao.campo}`);
    for (const type of ['mousePressed', 'mouseReleased']) {
      await cdp.enviar(
        'Input.dispatchMouseEvent',
        { type, x: ponto.x, y: ponto.y, button: 'left', clickCount: 1 },
        sessao
      );
    }
    await cdp.enviar('Input.insertText', { text: acao.texto }, sessao);
    // o anel de foco é do navegador; no aparelho ele não existe
    await avaliar(cdp, sessao, 'document.activeElement?.blur(), true');
  }

  await esperarRede(cdp, sessao);
}

/** Espera as escritas da ação chegarem ao banco e voltarem. */
async function esperarRede(cdp, sessao) {
  const limite = Date.now() + 30000;
  let quietas = 0;
  while (Date.now() < limite) {
    await sleep(300);
    const pendentes = await avaliar(cdp, sessao, 'window.__pendentes ?? 0');
    quietas = pendentes === 0 ? quietas + 1 : 0;
    if (quietas >= 3) return;
  }
}

async function passo(cdp, sessao, { rota, acoes = [], nome }) {
  await cdp.enviar('Page.navigate', { url: `${BASE}${rota}` }, sessao);
  await esperarPronta(cdp, sessao, rota);

  for (const acao of acoes) await executar(cdp, sessao, acao);
  if (!nome) return;

  await sleep(600); // deixa as animações de entrada assentarem
  const { data } = await cdp.enviar(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false },
    sessao
  );
  const destino = resolve(OUT, `${nome}.png`);
  writeFileSync(destino, Buffer.from(data, 'base64'));
  console.log(`  ${nome}.png  ${(statSync(destino).size / 1024).toFixed(0)} KB`);
}

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${resolve(WORK, 'chrome')}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let cdp;
try {
  cdp = conectar(await esperarChrome());
  await cdp.pronto;

  const { targetId } = await cdp.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.enviar('Target.attachToTarget', { targetId, flatten: true });
  await cdp.enviar('Page.enable', {}, sessionId);
  await cdp.enviar('Page.addScriptToEvaluateOnNewDocument', { source: CONTADOR }, sessionId);
  await cdp.enviar(
    'Emulation.setDeviceMetricsOverride',
    { width: TELA.largura, height: TELA.altura, deviceScaleFactor: TELA.escala, mobile: true },
    sessionId
  );

  console.log(`Percorrendo a demonstração em ${BASE}:`);
  for (const etapa of ROTEIRO) await passo(cdp, sessionId, etapa);
  console.log('Pronto.');
} finally {
  cdp?.fechar();
  chrome.kill('SIGKILL');
  rmSync(WORK, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
