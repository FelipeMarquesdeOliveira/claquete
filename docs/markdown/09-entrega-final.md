# 09 · Entrega Final

> O que mudou do protótipo para o produto, as decisões técnicas finais e como o
> APK é gerado.
>
> Disciplina: Mobile Development & IoT · FIAP · 3º ano de Engenharia de Software
>
> Etapa: Checkpoint 6 — Entrega final

---

## 1. O que mudou do CP5 para o CP6

O CP5 entregou um protótipo navegável com dados mockados e banco ligado. O CP6
fechou as três lacunas que o próprio documento do protótipo tinha deixado
registradas.

| Área | No CP5 | No CP6 |
|---|---|---|
| Catálogo de filmes | Nove filmes num JSON dentro do aplicativo | **API pública do TMDB**: o acervo inteiro, em português, com pôsteres e provedores de streaming do Brasil |
| Onde o filme vive | Arquivo no repositório | **Tabela `movies` no Postgres**, alimentada pela escolha do curador |
| Banco fora do ar | Tela vazia, sem explicação | **Queda para os dados locais**, com aviso na tela |
| Distribuição | Rodava em `npm run web` ou Expo Go | **APK instalável**, gerado pelo EAS Build |

### 1.1 A busca de filmes

A mudança mais visível está na tela do curador. Antes, escolher o filme era
escolher entre nove. Agora a busca consulta o TMDB e devolve qualquer filme já
lançado, com o pôster e os gêneros corretos.

A busca foi desenhada para ser barata: ela espera a digitação parar por 400ms
antes de sair para a rede, e traz só o necessário para a lista. Duração e
plataforma de streaming — que exigem duas chamadas a mais — são buscadas apenas
para o filme que o curador realmente escolhe.

> Isso atende o **desafio bônus** proposto no enunciado: integração com uma API
> pública real.

### 1.2 O catálogo virou tabela

Com filmes vindos de fora, guardar só o identificador na rodada não bastava: na
semana seguinte o aplicativo não saberia dizer o nome do que o clube assistiu.
A migração [`20261001165252_catalogo_de_filmes.sql`](../../supabase/migrations)
cria a tabela `movies`, e escolher um filme passa a ser também guardá-lo.

Os nove filmes herdados do CP4 entram na tabela com `poster_url` nulo de
propósito: a arte deles está no repositório desde o CP4 e continua sendo usada,
o que mantém as telas idênticas às conceituais.

### 1.3 O aplicativo não depende mais do banco para abrir

O Supabase gratuito **suspende projetos parados por uma semana** — e foi
exatamente o que aconteceu com este entre a entrega do CP5 e a do CP6. Um APK na
mão de outra pessoa pode ser aberto muito depois da última vez que alguém mexeu
no banco.

Antes, nessa situação, o aplicativo abria em branco. Agora ele desce para o
catálogo local, continua inteiramente navegável e diz o que aconteceu. A decisão
vale para qualquer falha de rede, não só para a pausa.

---

## 2. Decisões técnicas finais

| Decisão | Alternativa descartada | Por quê |
|---|---|---|
| **Busca no TMDB, catálogo no Postgres** | Buscar no TMDB toda vez que uma tela precisa de um filme | A rodada precisa saber o nome do filme mesmo offline, e repetir a chamada a cada tela gastaria cota da API sem necessidade |
| **Chave do TMDB opcional** | Exigir a chave para o aplicativo subir | Quem clona o repositório sem chave ainda consegue rodar tudo. Uma configuração ausente não deve ser motivo de aplicativo quebrado |
| **Queda para dados locais** | Mostrar uma tela de erro com "tentar de novo" | Um clube de cinema não é um app bancário: mostrar o conteúdo que se tem é mais útil do que bloquear a tela. O aviso mantém a honestidade |
| **APK em vez de App Bundle** | `app-bundle`, o padrão da Play Store | O enunciado pede um arquivo instalável. App Bundle só é instalável passando pela loja |
| **`appVersionSource: remote`** | Versionar à mão no `app.json` | O EAS incrementa o `versionCode` sozinho a cada build, o que evita conflito ao reenviar |
| **Sem autenticação** | Login por e-mail no Supabase Auth | Fora do escopo das três entregas. As políticas de RLS já estão no lugar, permissivas, prontas para passar a verificar o usuário quando houver login |

---

## 3. Como o APK é gerado

```bash
node scripts/build-apk.mjs
```

Um comando, e o APK sai em `docs/apk/claquete.apk` — **57 MB**, assinado e
instalável. O script existe porque a pasta `android/` **não** está no
repositório: ela é gerada pelo `expo prebuild` a partir do `app.json`, que é a
fonte da verdade sobre ícone, nome, pacote e tema. O preço dessa escolha é que
toda configuração nativa precisa ser reaplicada a cada geração, e é isso que o
script automatiza — a assinatura, o SDK, as arquiteturas e o encolhimento.

Três decisões ficaram registradas ali:

| Decisão | Por quê |
|---|---|
| A chave de assinatura mora em `.keystore/`, fora de `android/` | O prebuild apaga a pasta nativa inteira. Trocar de chave entre builds faria o Android recusar a atualização de um aplicativo já instalado |
| Só `arm64-v8a` e `x86_64` | Cobre qualquer celular Android atual e o emulador do Android Studio. Incluir as duas arquiteturas de 32 bits levava o APK de 57 MB para 103 MB, para atender aparelhos que praticamente não existem mais |
| `minifyEnabled` e `shrinkResources` ligados | Removem código e recursos não usados |

### 3.1 Pela nuvem, sem Android SDK na máquina

O [`eas.json`](../../eas.json) está configurado e o caminho da nuvem funciona
igual, para quem não tem o SDK instalado:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Nesse caminho o `.env` não sobe junto, então as três chaves precisam existir no
ambiente do EAS:

```bash
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://SEU-PROJETO.supabase.co"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sua-chave-anon"
npx eas-cli env:create --environment production --name EXPO_PUBLIC_TMDB_API_KEY --value "sua-chave-tmdb"
```

> As três são chaves de cliente: o Supabase protege o acesso pelas políticas de
> RLS, não por esconder a chave anônima. A `service_role` nunca entra aqui.

### 3.2 O que foi verificado no APK

O APK foi instalado no emulador do Android Studio (`Issy_API35`, Android 15) e
percorrido tela a tela. As capturas estão em
[`docs/evidencias/apk/`](../evidencias/apk). Instala, abre e lê o banco: zero
erros no `logcat`.

## 4. O que ficou de fora, e por quê

Registrar isto é parte da entrega: um produto honesto diz onde termina.

- **Criar clube e entrar por código** — a tela de abertura tem os dois botões,
  mas eles entram no clube de demonstração. O fluxo real depende de
  autenticação, que está fora do escopo das três entregas.
- **Os outros membros são simulados** — confirmam presença e votam com notas
  fixas. Com login, virariam pessoas de verdade; o código que simula está
  isolado em [`src/data/simulation.ts`](../../src/data/simulation.ts) e marcado
  como tal.
- **Sem atualização em tempo real** — duas telas abertas compartilham o mesmo
  banco, mas a segunda só vê a mudança ao recarregar. O Supabase oferece
  Realtime; ligá-lo é pequeno, e foi deixado de fora para não mexer em
  comportamento na véspera da entrega.
- **Notificações** — "sua vez de escolher" e "sessão hoje" estavam previstas no
  escopo como *importantes*, não essenciais. O produto funciona sem elas; com
  elas, funcionaria melhor.
- **Fontes muito ampliadas quebram o layout** — com a fonte do sistema no dobro
  do tamanho (ajuste de acessibilidade do Android), textos se sobrepõem em
  algumas telas. Foi descoberto testando o APK num emulador que estava nessa
  configuração. No tamanho padrão, que é o de praticamente todo aparelho, o
  layout está correto. Corrigir direito pede tipografia responsiva em todas as
  telas — trabalho real, não ajuste de véspera.
