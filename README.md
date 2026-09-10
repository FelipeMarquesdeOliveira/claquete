<div align="center">

<img src="assets/brand/logo-mark.png" width="120" alt="Claquete" />

# Claquete

**Toda semana um escolhe. Todo mundo julga.**

O clube de cinema dos seus amigos, com rodízio de curadoria e placar.

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/status-CP5%20Prot%C3%B3tipo%20funcional-FFC53D)
![Testes](https://img.shields.io/badge/testes-39%20passando-4ADE80)

</div>

---

## 📖 Sobre o projeto

**Claquete** é um aplicativo mobile que transforma o "vamo marcar de assistir
alguma coisa" — aquela mensagem que morre no grupo do WhatsApp — em um ritual
semanal que realmente acontece.

A ideia é simples e vem de um formato que funciona há décadas fora do digital:
o **clube do livro**. Ninguém escolhe em comitê. Cada semana, **uma pessoa** é
a curadora e decide o filme de todo mundo. Depois que o grupo assiste, cada
integrante dá sua nota — e a média não vai para o filme, vai para **quem
escolheu**. No fim da temporada, o aplicativo premia quem tem o melhor gosto do grupo.

> Projeto desenvolvido para a disciplina **Mobile Development & IoT** (3º ano de
> Engenharia de Software — FIAP), como entrega contínua dos Checkpoints 4, 5 e 6.

## 🎯 O problema

Escolher filme em grupo é um problema de decisão coletiva com poder de veto:
cinco pessoas, cinco vetos, nenhuma decisão. O resultado é sempre o mesmo —
meia hora percorrendo catálogos, ninguém decide, e cada um acaba assistindo sozinho.

Os apps existentes não resolvem isso porque atacam outro problema:
catálogos organizam **o acervo**, diários de filme registram **o passado
individual**. Nenhum deles cria o **compromisso social** que faz a sessão
acontecer.

O detalhamento está no [documento de escopo](docs/01-escopo.pdf).

## ⚙️ Como funciona

| Etapa | O que acontece |
|---|---|
| 1. Clube | Um integrante cria o clube e convida o grupo por código |
| 2. Temporada | O clube define quantas rodadas terá a temporada (ex: 8 semanas) |
| 3. Curadoria | A cada rodada, o aplicativo define por rodízio quem escolhe o filme |
| 4. Sessão | O curador escolhe o filme e marca a data da sessão |
| 5. Notas | Após a sessão, cada integrante atribui nota de 0 a 10 e registra uma resenha de uma linha |
| 6. Revelação | As notas só aparecem quando **todos** votam — sem efeito manada |
| 7. Placar | A média da rodada é o ponto do curador na temporada |

## 📱 O aplicativo

<div align="center">

<img src="docs/evidencias/2-rodada-da-semana.png" width="240" alt="Rodada da semana" /> <img src="docs/evidencias/4-votacao.png" width="240" alt="Votação" /> <img src="docs/evidencias/7-placar.png" width="240" alt="Placar da temporada" />

</div>

Capturas do aplicativo **em execução** — não são mockups. O protótipo é
navegável de ponta a ponta: dá para receber a vez, escolher o filme, confirmar
presença, dar a nota, ver o veredito e encontrar a rodada refletida no placar.

Todas as telas e o fluxo de navegação estão no
[documento de telas](docs/04-telas.pdf); as capturas ficam em
[`docs/evidencias/`](docs/evidencias).

## 📚 Documentação

| # | Documento | Conteúdo | Fonte |
|---|---|---|---|
| 01 | [**Escopo**](docs/01-escopo.pdf) | Problema, público-alvo, proposta de valor e escopo do MVP | [`01-escopo.md`](docs/markdown/01-escopo.md) |
| 02 | [**Marca**](docs/02-marca.pdf) | Nome, logo, paleta de cores, tipografia e tom de voz | [`02-marca.md`](docs/markdown/02-marca.md) |
| 03 | [**Pitch**](docs/03-pitch.pdf) | Modelo de negócio, monetização e diferencial competitivo | [`03-pitch.md`](docs/markdown/03-pitch.md) |
| 04 | [**Telas**](docs/04-telas.pdf) | Telas conceituais e fluxo de navegação | [`04-telas.md`](docs/markdown/04-telas.md) |
| 05 | [**Equipe**](docs/05-equipe.pdf) | Integrantes e papéis de cada um no projeto | [`05-equipe.md`](docs/markdown/05-equipe.md) |
| 06 | [**Roteiro do pitch**](docs/06-roteiro-pitch.pdf) | Roteiro de apresentação, slide a slide, com tempos e perguntas prováveis | [`06-roteiro-pitch.md`](docs/markdown/06-roteiro-pitch.md) |
| 07 | [**Protótipo**](docs/07-prototipo.pdf) | Arquitetura, decisões técnicas, dados mockados, testes e banco de dados | [`07-prototipo.md`](docs/markdown/07-prototipo.md) |

### 🎤 Pitch deck

A apresentação do pitch, em três formatos:

| Formato | Arquivo | Para quê |
|---|---|---|
| PDF | [`claquete-pitch-deck.pdf`](docs/pitch-deck/claquete-pitch-deck.pdf) | Apresentar em tela cheia, com a formatação garantida |
| PowerPoint | [`claquete-pitch-deck.pptx`](docs/pitch-deck/claquete-pitch-deck.pptx) | Abrir no PowerPoint, Google Slides ou Keynote |
| Imagens | [`slides/`](docs/pitch-deck/slides) | Um PNG por slide, para inserir em outros documentos |

No arquivo do PowerPoint cada slide entra como imagem de página inteira — assim
a apresentação projeta idêntica ao PDF mesmo em um computador que não tenha as
fontes da marca instaladas.

Os PDFs são o documento de entrega; o Markdown em [`docs/markdown/`](docs/markdown)
é a fonte a partir da qual eles são gerados. Para regerar:

```bash
node scripts/build-docs-pdf.mjs       # documentos em PDF
node scripts/build-pitch-deck.mjs     # deck de apresentação (PDF)
node scripts/build-deck-formats.mjs   # deck em PPTX e imagens dos slides
```

## 🛠️ Stack técnica

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **React Native + Expo (SDK 57)** | Build único para Android e iOS e geração de APK via EAS no CP6 |
| Linguagem | **TypeScript** (strict) | Erros de contrato de dados aparecem em tempo de escrita, não em produção |
| Navegação | **Expo Router** | Rotas baseadas em arquivos, com tipagem automática das rotas |
| Tipografia | **@expo-google-fonts** | Fontes da marca embarcadas no bundle, sem depender de rede |
| Design tokens | Módulo próprio em `src/theme` | Cor e tipografia definidas em um lugar só, direto do manual da marca |
| Estado | **Zustand** | O estado é pequeno e quase todo derivado; Context re-renderizaria demais e Redux traria cerimônia sem contrapartida |
| Banco de dados | **Supabase** (Postgres) | Funciona no Expo sem configuração nativa, e o modelo em SQL é inspecionável no painel |
| Testes | **Jest** em ambiente Node | As regras de negócio são funções puras, então não precisam de emulador para serem testadas |

## 📁 Estrutura de pastas

```
claquete/
├── app/                     # Rotas do Expo Router (cada arquivo é uma tela)
│   ├── _layout.tsx          # Layout raiz: fontes, tema e navegação
│   ├── index.tsx            # Abertura da marca
│   ├── (tabs)/              # Clube, Estante, Placar e Perfil
│   ├── curadoria.tsx        # Escolha do filme pelo curador
│   ├── votacao.tsx          # Nota e resenha
│   └── resultado.tsx        # Veredito da rodada
├── src/
│   ├── domain/              # Regras de negócio puras, com testes
│   ├── data/                # Contrato de repositório, JSON local e Supabase
│   ├── store/               # Estado da aplicação (Zustand)
│   ├── components/          # Componentes reutilizáveis de interface
│   ├── services/            # Integrações externas (Supabase, e TMDB no CP6)
│   ├── theme/               # Design tokens: cores, tipografia, espaçamento
│   └── utils/               # Funções utilitárias
├── supabase/
│   └── schema.sql           # Tabelas, políticas de acesso e clube de exemplo
├── assets/
│   ├── brand/               # Logo, assinatura e símbolo
│   ├── mock/posters/        # Pôsteres usados nas telas conceituais
│   └── *.png                # Ícone do app, adaptive icon, splash e favicon
├── scripts/
│   ├── generate-brand-icons.mjs   # Gera os ícones a partir dos design tokens
│   ├── generate-wordmark.mjs      # Gera a assinatura da marca
│   ├── build-docs-pdf.mjs         # Converte a documentação em PDF
│   ├── build-pitch-deck.mjs       # Monta o deck de apresentação
│   ├── build-deck-formats.mjs     # Exporta o deck em PPTX e imagens
│   ├── deck/                      # Fonte do deck (HTML e estilo)
│   ├── pdf/                       # Estilo de impressão dos documentos
│   └── mockup-3d/                 # Cena 3D que gera os mockups de aparelho
└── docs/
    ├── 01-escopo.pdf … 07-prototipo.pdf  # Documentação (entrega)
    ├── markdown/                     # Fonte da documentação
    ├── pitch-deck/                   # Deck em PDF, PPTX e imagens
    ├── telas/                        # Telas conceituais do CP4
    └── evidencias/                   # Capturas do aplicativo em execução
```

## 🚀 Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) 20 ou superior e npm.
Para rodar no celular, instale o app **Expo Go**
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
# 1. clonar o repositório
git clone https://github.com/FelipeMarquesdeOliveira/claquete.git
cd claquete

# 2. instalar as dependências
npm install

# 3. iniciar o projeto
npm start
```

Com o servidor no ar, escolha como abrir:

| Comando | Onde abre |
|---|---|
| `npm start` | Mostra o QR Code — escaneie com o Expo Go no celular |
| `npm run android` | Emulador Android (Android Studio) ou dispositivo conectado |
| `npm run ios` | Simulador iOS (somente macOS, requer Xcode) |
| `npm run web` | Navegador, em `http://localhost:8081` |

### Testes

```bash
npm test
```

São 39 testes cobrindo as regras de negócio (rodízio de curadoria, revelação
das notas, placar da temporada) e a coerência dos dados mockados.

### Banco de dados

O aplicativo roda com **dados locais** por padrão. Para ligá-lo ao Supabase,
crie o esquema no seu projeto — por `npx supabase db push`, com as migrações de
[`supabase/migrations/`](supabase/migrations), ou rodando
[`supabase/schema.sql`](supabase/schema.sql) no SQL Editor —, copie
`.env.example` para `.env` e preencha as duas chaves. O passo a passo completo
está na [documentação do protótipo](docs/07-prototipo.pdf).

### Outros comandos

```bash
node scripts/generate-brand-icons.mjs   # ícones da marca a partir dos tokens
node scripts/capture-evidence.mjs       # percorre a demonstração e fotografa as telas
```

## 🗺️ Roadmap dos checkpoints

| Checkpoint | Entrega | Status |
|---|---|---|
| **CP4** | Idealização: marca, escopo, pitch e setup do projeto | ✅ Entregue |
| **CP5** | Protótipo funcional, testes e banco de dados | ✅ Em entrega |
| **CP6** | App final e APK instalável via EAS Build | ⏳ Planejado |

## 👥 Equipe

| RM | Nome | Papel |
|---|---|---|
| RM556319 | **Felipe Marques** | Product Owner & Desenvolvedor Mobile |
| RM556309 | **Gabriel Barros Cisoto** | Designer de Produto & Estratégia de Negócio |

A divisão detalhada do trabalho por checkpoint está em
[documento da equipe](docs/05-equipe.pdf).

## 🎬 Créditos

Os pôsteres usados nas telas conceituais vêm do
**[The Movie Database (TMDB)](https://www.themoviedb.org)**. Este produto usa a
API do TMDB, mas não é endossado nem certificado pelo TMDB.

## 📄 Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).
