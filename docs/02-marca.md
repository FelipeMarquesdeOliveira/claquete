# 02 · Manual da Marca

> **Claquete** — identidade visual definida no Checkpoint 4.
> Tudo neste documento está implementado em código em
> [`src/theme`](../src/theme), que é a fonte única de verdade do app.

---

## 1. Nome

### **Claquete**

A claquete é o objeto que **marca o início de uma tomada**. É a primeira coisa
que aparece antes de qualquer cena ser rodada, e o som dela é o combinado de
que todo mundo começa junto, no mesmo instante.

É exatamente o que o app faz: **marca o início da rodada** e alinha o grupo em
torno de um mesmo momento.

| Critério | Avaliação |
|---|---|
| Curto | Três sílabas, cabe embaixo do ícone sem truncar |
| Brasileiro | Palavra do vocabulário de cinema em português, sem soar importada |
| Concreto | Vira logo sozinho — o objeto já é uma forma reconhecível |
| Verbal | Rende linguagem própria: *"bateu a claquete"* para o início da rodada |

**Nomes descartados:** *Sessão* (genérico demais, impossível de buscar),
*Poltrona* (remete a assistir passivamente, não a escolher),
*Cabine* (associação fraca fora do meio técnico).

## 2. Logo

### 2.1 Conceito

A marca **não desenha o objeto — ela faz o gesto**.

Um bloco sólido, aberto por um único **corte diagonal**. É a claquete batendo,
e é também o corte de montagem que transforma material bruto em filme. O mesmo
corte atravessa o nome na assinatura: a metade de cima escorrega, como se a
palavra tivesse acabado de ser cortada.

> **Por que não uma claquete desenhada.** Uma claquete literal é o ícone mais
> previsível possível para cinema — existe igual em qualquer banco de imagens e
> não pertence a ninguém. Reduzir a marca a um gesto que só ela faz é o que
> torna o símbolo reconhecível e defensável.

O corte também carrega a mecânica do produto: a rodada é aberta por alguém, e
o clube é dividido entre quem escolheu e quem julga.

### 2.2 Arquivos

| Arquivo | Uso |
|---|---|
| [`assets/brand/logo-mark.svg`](../assets/brand/logo-mark.svg) | Símbolo em vetor |
| [`assets/brand/logo-mark.png`](../assets/brand/logo-mark.png) | Símbolo em 512 px, para documentos e slides |
| [`assets/brand/wordmark.png`](../assets/brand/wordmark.png) | Assinatura: o nome com o corte, em fundo transparente |
| [`assets/brand/logo-horizontal.svg`](../assets/brand/logo-horizontal.svg) | Assinatura horizontal: símbolo + nome |
| [`assets/icon.png`](../assets/icon.png) | Ícone do aplicativo, âmbar de ponta a ponta |
| [`assets/android-icon-*.png`](../assets/) | Adaptive icon do Android (fundo, frente e monocromático) |

Os PNGs do símbolo são **gerados por código** a partir dos tokens da paleta,
pelo script [`scripts/generate-brand-icons.mjs`](../scripts/generate-brand-icons.mjs);
a assinatura sai de [`scripts/generate-wordmark.mjs`](../scripts/generate-wordmark.mjs).
Mudou a cor no manual, roda os scripts e toda a marca acompanha.

### 2.3 Geometria

Definida em uma grade de 200 × 200:

| Elemento | Medida |
|---|---|
| Bloco | 200 × 200, raio de canto 46 (23%) |
| Corte | espessura 18 (9%), inclinação **−12°**, centro na altura 88 |
| Assinatura | corte com a mesma inclinação; metade de cima deslocada 5 à direita e 3 acima |

A inclinação de −12° é a única constante visual entre símbolo e assinatura —
é ela que faz os dois lerem como a mesma marca.

### 2.4 Regras de uso

✅ **Pode:**
- Usar o símbolo sozinho quando o nome já estiver no contexto
- Aplicar o ícone âmbar de ponta a ponta, deixando o sistema operacional recortar o formato
- Reduzir até 20 px — o corte é a última coisa a desaparecer

❌ **Não pode:**
- Mudar a inclinação do corte ou a espessura dele
- Recolorir fora da paleta oficial, ou usar gradiente no bloco
- Adicionar contorno, sombra ou brilho
- Reconstituir o nome cortado com a fonte inteira, sem o corte

## 3. Paleta de cores

O ponto de partida é a experiência física do cinema: **sala escura + luz âmbar
do projetor + vermelho da poltrona**.

### 3.1 Cores da marca

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#FFC53D` | Âmbar do projetor. Ação principal, notas, destaques e o elemento que guia o olho |
| `secondary` | `#E23E57` | Vermelho da poltrona. Estados de urgência: "sua vez", prazo acabando |
| `background` | `#0E0E12` | Preto da sala. Fundo padrão de todas as telas |
| `surface` | `#1A1A21` | Cartões, listas e blocos de conteúdo |
| `surfaceAlt` | `#24242D` | Divisores, estados pressionados e elementos inativos |
| `text` | `#F5F5F7` | Texto principal |
| `textMuted` | `#9A9AA5` | Texto secundário, legendas e metadados |

### 3.2 Cores semânticas

| Token | Hex | Uso |
|---|---|---|
| `success` | `#4ADE80` | Rodada concluída, voto registrado |
| `warning` | `#FBBF24` | Prazo próximo do fim |
| `danger` | `#EF4444` | Erro e ações destrutivas |

### 3.3 Acessibilidade

Contraste medido segundo a WCAG 2.1 (mínimo AA para texto normal: **4.5:1**).

| Combinação | Contraste | Situação |
|---|---|---|
| `text` sobre `background` | **17.7:1** | ✅ AAA |
| `text` sobre `surface` | **15.9:1** | ✅ AAA |
| `primary` sobre `background` | **12.2:1** | ✅ AAA |
| `background` sobre `primary` (botão) | **12.2:1** | ✅ AAA |
| `textMuted` sobre `background` | **6.9:1** | ✅ AA |
| `success` sobre `background` | **11.1:1** | ✅ AAA |
| `secondary` sobre `background` | **4.6:1** | ⚠️ AA no limite |
| `secondary` sobre `surface` | **4.2:1** | ❌ abaixo de AA |

> **Regra derivada:** o vermelho `secondary` **não é cor de texto corrido**.
> Vale para números grandes, ícones, bordas e etiquetas — nunca para parágrafo,
> especialmente sobre `surface`.

## 4. Tipografia

| Papel | Fonte | Por quê |
|---|---|---|
| **Display** | **Bebas Neue** | Condensada e caixa-alta, com o mesmo caráter de cartaz de cinema e de crédito de filme. Sustenta títulos grandes e números de nota sem ocupar a linha inteira |
| **Texto** | **Inter** | Desenhada para tela, com altura de x alta. Aguenta corpo 13 px em celular sem cansar |

Ambas são open source (SIL Open Font License) e vêm embarcadas no bundle via
`@expo-google-fonts`, sem depender de rede em tempo de execução.

### 4.1 Escala tipográfica

Implementada em [`src/theme/typography.ts`](../src/theme/typography.ts):

| Token | Fonte | Tamanho | Uso |
|---|---|---|---|
| `hero` | Bebas Neue | 56 | Nome da marca na abertura |
| `title` | Bebas Neue | 32 | Título de tela e de seção |
| `score` | Bebas Neue | 40 | Nota do filme e pontuação do curador |
| `subtitle` | Inter Medium | 18 | Subtítulo e tagline |
| `body` | Inter Regular | 15 | Texto corrido |
| `caption` | Inter Regular | 13 | Metadados, datas e legendas |
| `label` | Inter Bold | 12 | Etiquetas em caixa alta, com espaçamento de 1.5 |

## 5. Espaçamento e forma

| Token | Valor | Uso |
|---|---|---|
| `xs` … `xxl` | 4 · 8 · 16 · 24 · 32 · 48 | Escala de espaçamento em múltiplos de 4 |
| `radius.sm` | 8 px | Etiquetas e elementos pequenos |
| `radius.md` | 12 px | Botões e campos |
| `radius.lg` | 20 px | Cartões e o próprio símbolo da marca |
| `radius.pill` | 999 px | Avatares e chips |

## 6. Tom de voz

A marca fala como **quem organiza o encontro**: de forma direta, com humor e
sem esnobismo de cinéfilo.

| Princípio | ✅ Assim | ❌ Não assim |
|---|---|---|
| Direto | "Sua vez de escolher" | "Você foi designado como curador da rodada" |
| Bem-humorado | "Não estraga tudo" | "Escolha com responsabilidade" |
| Sem esnobismo | "Filme da semana" | "Obra selecionada pela curadoria" |
| Coletivo | "O clube ainda não votou" | "Existem votos pendentes no sistema" |

**Frases-chave da marca:**
- Tagline: *"Toda semana um escolhe. Todo mundo julga."*
- Início da rodada: *"Bateu a claquete."*
- Vez do curador: *"É com você essa semana."*
- Notas reveladas: *"O veredito saiu."*
