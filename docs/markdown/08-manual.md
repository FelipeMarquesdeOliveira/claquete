# 08 · Manual de Uso

> Como instalar, abrir e usar o **Claquete**.
>
> Disciplina: Mobile Development & IoT · FIAP · 3º ano de Engenharia de Software
>
> Etapa: Checkpoint 6 — Entrega final

---

## 1. Como instalar

### Android, pelo APK

O arquivo `claquete.apk` acompanha esta entrega. Para gerar um novo a partir
do código, veja a [documentação da entrega final](09-entrega-final.md).

1. Copie o arquivo `claquete.apk` para o celular (cabo, Drive, WhatsApp — tanto faz)
2. Toque no arquivo. O Android vai avisar que o aplicativo não veio da Play Store
3. Em **Configurações → Permitir desta fonte**, autorize o aplicativo que está instalando (o gerenciador de arquivos ou o navegador)
4. Volte e toque em **Instalar**

> Esse aviso é normal: aplicativos distribuídos fora da loja sempre pedem essa
> autorização. O APK é assinado com uma chave de desenvolvimento própria do
> projeto, não com a de uma loja.

### Sem instalar nada, pelo navegador

```bash
npm install
npm run web
```

Abre em `http://localhost:8081`. É a forma mais rápida de ver o aplicativo
funcionando e foi assim que as evidências desta entrega foram capturadas.

### No seu próprio celular, pelo Expo Go

```bash
npm start
```

Escaneie o QR Code com o **Expo Go** (disponível na Play Store e na App Store).

---

## 2. O que o aplicativo faz

O Claquete é um **clube de cinema entre amigos**. Toda semana uma pessoa do
grupo é a curadora e escolhe o filme de todo mundo. Depois da sessão, cada
integrante dá uma nota — e a média não vai para o filme, vai para **quem
escolheu**. No fim da temporada, ganha quem tem o melhor gosto.

O aplicativo abre direto no clube de demonstração **Cinema da Galera**, com cinco
membros e uma temporada de oito rodadas em andamento.

---

## 3. As telas

| Aba | Para que serve |
|---|---|
| **Clube** | A rodada da semana: o filme, a data da sessão, quem confirmou presença e o botão da vez |
| **Estante** | Tudo que o clube já assistiu, com a nota de cada rodada |
| **Placar** | A classificação da temporada, por média de quem curou |
| **Perfil** | Suas notas, a fonte de dados em uso e os controles da demonstração |

Fora das abas, três telas aparecem no meio do fluxo: **escolha do filme**
(quando é a sua vez), **sua nota** (depois da sessão) e **veredito** (quando o
último voto entra).

---

## 4. Uma rodada do começo ao fim

É este o caminho que a apresentação percorre. Comece na aba **Clube**.

**1. Escolher o filme** — quando a vez é sua, o clube mostra *É com você essa
semana*. Toque em **Escolher o filme**, digite o nome na busca e toque no
resultado. A busca consulta o catálogo do TMDB: dá para escolher qualquer filme,
não só os que já estão no aplicativo. Filmes que o clube já assistiu não
aparecem.

**2. Bater a claquete** — confirma a escolha e marca a sessão. A rodada passa a
ter filme e data, e o clube inteiro é avisado.

**3. Confirmar presença** — cada pessoa diz que vai estar na sessão. O contador
no card mostra quantos já confirmaram.

**4. Já assistimos** — abre a votação. Só aparece para quem confirmou presença.

**5. Dar minha nota** — escolha de 0 a 10 e escreva uma resenha de uma linha.
**As notas ficam fechadas até todo mundo votar** — é a regra central do produto,
para que ninguém seja influenciado pela nota de quem votou antes.

**6. O veredito** — com o último voto, as notas aparecem de uma vez, a média é
calculada e os pontos vão para quem escolheu o filme.

**7. O placar** — a rodada entra na classificação da temporada, e a vez passa
para a próxima pessoa do rodízio.

---

## 5. Controles da demonstração

Na aba **Perfil**:

- **Ver como outro membro** — o Claquete é um produto de grupo, mas a
  apresentação acontece em um aparelho só. Trocar de membro permite alcançar
  telas que existem apenas para o curador. Ao recarregar o aplicativo, volta
  para o Felipe.
- **Reiniciar demonstração** — devolve o clube ao estado inicial: rodada 5
  esperando a sessão, três presenças confirmadas, nenhum voto. Serve para
  apresentar duas vezes seguidas.
- **Fonte de dados** — mostra se o aplicativo está lendo do Supabase ou dos
  dados locais.

> Os outros quatro membros do clube são simulados: eles confirmam presença e
> votam sozinhos, com notas fixas. Sem isso, a regra de revelação nunca poderia
> ser demonstrada em um aparelho só — a rodada ficaria esperando para sempre.

---

## 6. Se algo não funcionar

| O que aparece | O que é | O que fazer |
|---|---|---|
| Tarja vermelha: *"Banco indisponível. Mostrando os dados locais"* | O projeto do Supabase está pausado (o plano gratuito suspende projetos parados por uma semana) | Nada: o aplicativo continua funcionando com os dados locais. Para voltar ao banco, use **Restore project** no painel do Supabase |
| Tarja vermelha com outra mensagem | Uma gravação falhou — rede fora do ar, por exemplo | Tente de novo. O aplicativo avisa em vez de fingir que salvou |
| A busca de filmes só acha o que o clube já tem | A chave do TMDB não está configurada | Preencha `EXPO_PUBLIC_TMDB_API_KEY` no `.env`. Sem ela o aplicativo funciona, com menos filmes |
| O Android bloqueia a instalação | Proteção padrão contra aplicativos fora da loja | Autorize a fonte, como descrito na seção 1 |

---

## 7. Privacidade e dados

O aplicativo não pede login, não coleta dados pessoais e não envia nada para
terceiros além das duas APIs que usa: o **Supabase**, onde ficam os dados do
clube, e o **TMDB**, de onde vêm os filmes. O clube da demonstração é fictício.
