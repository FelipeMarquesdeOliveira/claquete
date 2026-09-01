<div align="center">

<img src="assets/brand/logo-mark.png" width="120" alt="Claquete" />

# Claquete

**Toda semana um escolhe. Todo mundo julga.**

O clube de cinema dos seus amigos, com rodízio de curadoria e placar.

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/status-CP4%20Idealiza%C3%A7%C3%A3o-FFC53D)

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
escolheu**. No fim da temporada, o app coroa quem tem o melhor gosto do grupo.

> Projeto desenvolvido para a disciplina **Mobile Development & IoT** (3º ano de
> Engenharia de Software — FIAP), como entrega contínua dos Checkpoints 4, 5 e 6.

## 🎯 O problema

Escolher filme em grupo é um problema de decisão coletiva com poder de veto:
cinco pessoas, cinco vetos, nenhuma decisão. O resultado é sempre o mesmo —
meia hora rolando catálogo, ninguém decide, e cada um acaba assistindo sozinho.

Os apps existentes não resolvem isso porque atacam outro problema:
catálogos organizam **o acervo**, diários de filme registram **o passado
individual**. Nenhum deles cria o **compromisso social** que faz a sessão
acontecer.

O detalhe completo está em [docs/01-escopo.md](docs/01-escopo.md).

## ⚙️ Como funciona

| Etapa | O que acontece |
|---|---|
| 1. Clube | Alguém cria o clube e convida o grupo por código |
| 2. Temporada | O clube define quantas rodadas terá a temporada (ex: 8 semanas) |
| 3. Curadoria | A cada rodada o app sorteia/rodiziona quem escolhe o filme |
| 4. Sessão | O curador escolhe o filme e marca a data da sessão |
| 5. Notas | Depois da data, cada um dá nota de 0 a 10 e escreve uma linha |
| 6. Revelação | As notas só aparecem quando **todos** votam — sem efeito manada |
| 7. Placar | A média da rodada é o ponto do curador na temporada |

## 📱 Telas conceituais

🎬 **[Ver as telas conceituais do Claquete](https://claude.ai/code/artifact/cd8d30a8-913f-499c-a325-f4fbdea29648)**

Seis telas em formato de celular, com a identidade visual já aplicada. As telas
desta etapa são conceituais (não funcionais) — a descrição de cada uma e o
fluxo de navegação estão em [docs/04-telas.md](docs/04-telas.md).

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [01 — Escopo](docs/01-escopo.md) | Problema, público-alvo, proposta de valor e escopo do MVP |
| [02 — Marca](docs/02-marca.md) | Nome, logo, paleta de cores, tipografia e tom de voz |
| [03 — Pitch](docs/03-pitch.md) | Modelo de negócio, monetização e diferencial competitivo |
| [04 — Telas](docs/04-telas.md) | Telas conceituais e fluxo de navegação |
| [05 — Equipe](docs/05-equipe.md) | Integrantes e papéis de cada um no projeto |

## 🛠️ Stack técnica

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **React Native + Expo (SDK 57)** | Build único para Android e iOS e geração de APK via EAS no CP6 |
| Linguagem | **TypeScript** (strict) | Erros de contrato de dados aparecem em tempo de escrita, não em produção |
| Navegação | **Expo Router** | Rotas baseadas em arquivos, com tipagem automática das rotas |
| Tipografia | **@expo-google-fonts** | Fontes da marca embarcadas no bundle, sem depender de rede |
| Design tokens | Módulo próprio em `src/theme` | Cor e tipografia definidas em um lugar só, direto do manual da marca |

## 📁 Estrutura de pastas

```
claquete/
├── app/                    # Rotas do Expo Router (cada arquivo = uma tela)
│   ├── _layout.tsx         # Layout raiz: fontes, tema e navegação
│   └── index.tsx           # Tela de abertura da marca
├── src/
│   ├── theme/              # Design tokens: cores, tipografia, espaçamento
│   ├── components/         # Componentes reutilizáveis de UI
│   ├── features/           # Módulos por funcionalidade (clube, rodada, notas)
│   ├── data/               # Dados mockados (JSON) usados a partir do CP5
│   ├── hooks/              # Hooks compartilhados
│   ├── services/           # Integrações externas (ex: TMDB)
│   ├── types/              # Tipos e contratos de dados
│   └── utils/              # Funções utilitárias
├── assets/
│   ├── brand/              # Logo em vetor e PNG
│   └── *.png               # Ícone do app, adaptive icon e favicon
├── scripts/
│   └── generate-brand-icons.mjs   # Gera os PNGs da marca a partir dos tokens
└── docs/                   # Documentação do projeto (escopo, marca, pitch)
```

## 🚀 Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) 20 ou superior e npm.
Para rodar no celular, instale o app **Expo Go**
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
# 1. clonar o repositório
git clone https://github.com/<usuario>/claquete.git
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

Para regerar os ícones da marca depois de mudar a paleta:

```bash
node scripts/generate-brand-icons.mjs
```

## 🗺️ Roadmap dos checkpoints

| Checkpoint | Entrega | Status |
|---|---|---|
| **CP4** | Idealização: marca, escopo, pitch e setup do projeto | ✅ Em entrega |
| **CP5** | Protótipo funcional com dados mockados e testes | ⏳ Planejado |
| **CP6** | App final e APK instalável via EAS Build | ⏳ Planejado |

## 👥 Equipe

Os integrantes e o papel de cada um estão em
[docs/05-equipe.md](docs/05-equipe.md).

## 📄 Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).
