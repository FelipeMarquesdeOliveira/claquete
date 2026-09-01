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

O símbolo é uma **claquete cujas listras diagonais reaparecem no corpo como
barras de nota**. As duas metades contam a mecânica do app em uma imagem só:

- **Barra superior listrada** → a sessão que começa (a escolha do curador)
- **Barras inferiores** → as notas que o grupo dá depois

### 2.2 Arquivos

| Arquivo | Uso |
|---|---|
| [`assets/brand/logo-mark.svg`](../assets/brand/logo-mark.svg) | Símbolo em vetor, para qualquer tamanho |
| [`assets/brand/logo-horizontal.svg`](../assets/brand/logo-horizontal.svg) | Assinatura horizontal: símbolo + nome + tagline |
| [`assets/brand/logo-mark.png`](../assets/brand/logo-mark.png) | Símbolo em 512 px, para documentos e slides |
| [`assets/icon.png`](../assets/icon.png) | Ícone do aplicativo (1024 px) |
| [`assets/android-icon-*.png`](../assets/) | Adaptive icon do Android (fundo, frente e monocromático) |

Todos os PNGs são **gerados por código** a partir dos tokens da paleta, pelo
script [`scripts/generate-brand-icons.mjs`](../scripts/generate-brand-icons.mjs).
Mudou a cor no manual, roda o script e todos os ícones acompanham — a marca não
sai do lugar por descuido.

### 2.3 Regras de uso

✅ **Pode:**
- Usar o símbolo sozinho quando o nome já estiver no contexto
- Aplicar sobre fundos escuros (`#0E0E12` a `#24242D`)
- Reduzir até 24 px — as barras continuam legíveis

❌ **Não pode:**
- Recolorir o símbolo fora da paleta oficial
- Distorcer a proporção ou rotacionar
- Aplicar sobre foto sem uma camada escura de contraste
- Adicionar sombra, contorno ou gradiente

## 3. Paleta de cores

O ponto de partida é a experiência física do cinema: **sala escura + luz âmbar
do projetor + vermelho da poltrona**.

### 3.1 Cores da marca

| Amostra | Token | Hex | Uso |
|---|---|---|---|
| 🟨 | `primary` | `#FFC53D` | Âmbar do projetor. Ação principal, notas, destaques e o elemento que guia o olho |
| 🟥 | `secondary` | `#E23E57` | Vermelho da poltrona. Estados de urgência: "sua vez", prazo acabando |
| ⬛ | `background` | `#0E0E12` | Preto da sala. Fundo padrão de todas as telas |
| ⬛ | `surface` | `#1A1A21` | Cartões, listas e blocos de conteúdo |
| ⬛ | `surfaceAlt` | `#24242D` | Divisores, estados pressionados e elementos inativos |
| ⬜ | `text` | `#F5F5F7` | Texto principal |
| ⬜ | `textMuted` | `#9A9AA5` | Texto secundário, legendas e metadados |

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
| **Display** | **Bebas Neue** | Condensada e maiúscula, com a mesma cara de cartaz de cinema e de crédito de filme. Segura títulos grandes e números de nota sem ocupar linha inteira |
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

A marca fala como **um amigo que organiza o rolê**: direto, com humor, sem
esnobismo de cinéfilo.

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
