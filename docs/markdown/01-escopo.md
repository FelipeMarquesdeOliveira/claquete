# 01 · Documento de Escopo

> **Claquete** — o clube de cinema dos seus amigos, com rodízio de curadoria e placar.
>
> Disciplina: Mobile Development & IoT · FIAP · 3º ano de Engenharia de Software
>
> Etapa: Checkpoint 4 — Idealização

---

## 1. Contexto

Nunca houve tanto conteúdo disponível e tão pouca decisão tomada. Um assinante
médio de streaming tem acesso a dezenas de milhares de títulos distribuídos em
três ou quatro serviços diferentes, e mesmo assim a frase mais repetida na
frente da TV continua sendo *"não tem nada pra ver"*.

O que existe não é falta de conteúdo: é **excesso de opção sem critério de
corte**. E quando essa decisão precisa ser tomada em grupo, o problema deixa de
ser de catálogo e vira um problema de **coordenação social**.

## 2. O problema

> **Combinar de assistir um filme com os amigos é fácil. Fazer acontecer, não.**

A conversa é sempre igual e todo mundo reconhece:

```
— gente, bora ver um filme sábado?
— boraaa
— o que vocês querem ver?
— sei lá, qualquer coisa
— (silêncio de três dias)
```

Três mecanismos explicam por que isso trava:

| Mecanismo | O que acontece |
|---|---|
| **Poder de veto distribuído** | Em um grupo de 5 pessoas, qualquer um pode vetar. Quanto maior o grupo, menor a probabilidade de um título atravessar todos os filtros — e a decisão nunca se fecha. |
| **Difusão de responsabilidade** | Como escolher é tarefa de "todo mundo", não é tarefa de ninguém. Sem dono, a decisão não tem prazo nem cobrança. |
| **Medo de errar a escolha** | Quem sugere carrega o risco social de indicar um filme ruim. O incentivo racional é não sugerir nada. |

O resultado é sempre o mesmo: **a sessão não acontece e cada um assiste sozinho**
— apesar de todos quererem assistir juntos.

### 2.1 Por que os apps existentes não resolvem

| Solução atual | Que problema ela ataca | Por que não resolve o nosso |
|---|---|---|
| **Netflix, Prime, Max** | Encontrar o que assistir dentro de um catálogo | Recomendam para o indivíduo. Não existe "nós" no algoritmo, nem compromisso de data. |
| **Letterboxd** | Registrar e avaliar o que **eu** já assisti | É um diário individual e retrospectivo. Não organiza a próxima sessão nem cria ritual. |
| **JustWatch** | Descobrir em qual streaming o filme está | Resolve um problema logístico, não o de decisão coletiva. |
| **Grupo de WhatsApp** | Combinar qualquer coisa | É exatamente onde a decisão morre: sem dono, sem prazo e sem placar. |
| **Enquete no grupo** | Votar entre opções | Só funciona se alguém já tiver montado a lista — ou seja, o problema continua de pé. |

### 2.2 A solução já existe fora do digital

Clubes do livro resolveram esse mesmo problema há mais de dois séculos com uma
regra de simplicidade desconcertante: **turno de escolha**. Não se vota o próximo
livro — cada mês uma pessoa escolhe, e o grupo lê. A regra elimina o veto,
cria um dono e dá prazo.

**O Claquete digitaliza essa regra e adiciona placar.**

## 3. Público-alvo

### 3.1 Perfil

- **Faixa etária:** 18 a 35 anos
- **Perfil digital:** assina pelo menos um streaming e mantém grupos de mensagem ativos
- **Comportamento:** assiste a pelo menos um filme por semana e já tentou (sem sucesso) marcar sessão com o grupo
- **Recorte central:** **grupos que já existem** — amigos de faculdade, colegas de trabalho, casais, irmãos e famílias que moram em cidades diferentes

> O produto não tenta criar comunidades novas. Ele organiza grupos que **já
> existem** e já conversam em outro lugar. Isso reduz drasticamente o custo de
> aquisição: o app entra por convite de alguém de dentro.

### 3.2 Personas

Arquétipos que orientam as decisões de produto. O clube de demonstração das
telas conceituais é ilustrativo e não corresponde a estas personas.

**Marina, 23 — a organizadora frustrada**
Estudante, mora com mais três pessoas. É sempre ela quem propõe a sessão,
monta a lista de opções e ainda ouve "esse não". *Quer dividir a responsabilidade da escolha sem perder o ritual.*

**Caio, 27 — o crítico do grupo**
Assiste a três filmes por semana e tem opinião sobre todos. Já usa Letterboxd
sozinho. *Quer provar que tem o melhor gosto do grupo — e o placar do Claquete
é exatamente o palco que faltava.*

**Bia e Rafa, 25 e 26 — casal à distância**
Namoram entre São Paulo e Curitiba. Sentem falta de um programa recorrente que
seja "deles". *Querem um compromisso semanal leve, que não dependa de um dos
dois se lembrar de propor.*

## 4. Proposta de valor

> **Para** grupos de amigos que querem assistir filmes juntos
> **mas** nunca conseguem decidir o que ver,
> **o Claquete** é um clube de cinema no celular
> **que** dá a escolha a uma pessoa por vez e transforma as notas do grupo em
> um campeonato de curadoria.
> **Diferente de** catálogos e diários de filme,
> **ele** não organiza o acervo: organiza **o compromisso**.

### 4.1 Os três pilares

| Pilar | O que é | Por que importa |
|---|---|---|
| 🎬 **Ritual** | Uma rodada por semana, com data marcada e curador definido | Cria recorrência sem depender da boa vontade de ninguém |
| ⚖️ **Regra justa** | Rodízio automático de quem escolhe, sem votação prévia | Elimina o veto cruzado e o medo de sugerir |
| 🏆 **Placar** | A média das notas vira ponto do curador, com pódio de temporada | Converte a escolha em disputa — e disputa traz o grupo de volta |

### 4.2 Decisão de produto: notas fechadas

As notas de uma rodada só são reveladas quando **todos** os membros votaram.
É uma decisão deliberada de produto: sem isso, quem vota por último ancora sua
nota na média já visível, e o placar deixa de medir gosto para medir influência
social.

## 5. Escopo do MVP

### 5.1 Funcionalidades planejadas

| # | Funcionalidade | Prioridade | Entrega |
|---|---|---|---|
| F1 | Criar clube e entrar por código de convite | Essencial | CP5 |
| F2 | Rodízio automático do curador a cada rodada | Essencial | CP5 |
| F3 | Curador escolhe o filme e define a data da sessão | Essencial | CP5 |
| F4 | Nota de 0 a 10 com resenha de uma linha | Essencial | CP5 |
| F5 | Revelação das notas somente após todos votarem | Essencial | CP5 |
| F6 | Placar da temporada com pódio de curadores | Essencial | CP5 |
| F7 | Estante: histórico de tudo que o clube já assistiu | Importante | CP6 |
| F8 | Busca de filmes com pôster e sinopse (API TMDB) | Importante | CP6 |
| F9 | Notificação de "sua vez de escolher" e "sessão hoje" | Importante | CP6 |
| F10 | Perfil com estatísticas pessoais e gêneros preferidos | Desejável | CP6 |
| F11 | Retrospectiva da temporada em card compartilhável | Desejável | CP6 |

### 5.2 Fora de escopo

Registrado explicitamente para proteger o prazo dos três checkpoints:

- ❌ Reprodução ou hospedagem de qualquer conteúdo audiovisual
- ❌ Venda de ingresso ou intermediação de pagamento dentro do app
- ❌ Chat em tempo real (o grupo já conversa em outro lugar)
- ❌ Rede social pública com feed aberto e perfis abertos
- ❌ Versão web responsiva (o alvo é mobile; a web serve só para desenvolvimento)

## 6. Métricas de sucesso

O produto vive ou morre pela recorrência, então a métrica principal não é
download nem cadastro:

| Métrica | Definição | Meta de referência |
|---|---|---|
| ⭐ **Sobrevivência do ritual** | % de clubes que chegam à 4ª rodada consecutiva | ≥ 40% |
| **Taxa de conclusão de rodada** | Rodadas em que todos os membros votaram | ≥ 70% |
| **Tamanho médio do clube** | Membros ativos por clube | 4 a 6 |
| **Conversão para Pro** | Usuários pagantes sobre usuários ativos | 3% a 5% |

## 7. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Grupo abandona na 2ª rodada | Alto | Notificação de "sua vez" e prazo visível para a escolha do curador |
| Curador não escolhe a tempo | Médio | Prazo de escolha; vencido o prazo, a vez passa automaticamente |
| Grupo pequeno demais (2 pessoas) | Médio | Modo casal, com rodízio alternado e sem pódio |
| Dependência da API do TMDB | Médio | Camada de serviço isolada em `src/services` e catálogo mockado como fallback |
| Escopo maior que o prazo dos CPs | Alto | Prioridades declaradas na seção 5.1 e lista explícita de fora de escopo |
