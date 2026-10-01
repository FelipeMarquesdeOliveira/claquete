/**
 * Gera o APK instalável do Claquete.
 *
 * O projeto não guarda a pasta `android/` no repositório: ela é gerada pelo
 * `expo prebuild` a partir do `app.json`, que é a fonte da verdade sobre ícone,
 * nome, pacote e tema. O preço disso é que toda configuração nativa precisa ser
 * reaplicada a cada geração — e é exatamente isso que este script faz, para que
 * o APK saia igual na máquina de qualquer pessoa.
 *
 * A chave de assinatura fica em `.keystore/`, fora de `android/`, porque o
 * prebuild apaga a pasta nativa inteira. Ela é criada na primeira execução e
 * reaproveitada depois: trocar de chave entre builds faria o Android recusar a
 * atualização de um aplicativo já instalado.
 *
 * Alternativa na nuvem, sem Android SDK na máquina:
 *   npx eas-cli build --platform android --profile preview
 *
 * Uso: node scripts/build-apk.mjs
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = resolve(ROOT, 'android');
const CHAVES = resolve(ROOT, '.keystore');
const KEYSTORE = resolve(CHAVES, 'claquete.keystore');
const DESTINO = resolve(ROOT, 'docs/apk/claquete.apk');

const SENHA = process.env.CLAQUETE_KEYSTORE_PASSWORD ?? 'claquete2026';
const ALIAS = 'claquete';
const SDK = process.env.ANDROID_HOME ?? resolve(homedir(), 'Library/Android/sdk');

const rodar = (comando, args, cwd = ROOT) =>
  execFileSync(comando, args, { cwd, stdio: 'inherit', env: { ...process.env, ANDROID_HOME: SDK } });

function passo(texto) {
  console.log(`\n→ ${texto}`);
}

// ---------------------------------------------------------------- assinatura

if (!existsSync(KEYSTORE)) {
  passo('Criando a chave de assinatura (só acontece uma vez)');
  mkdirSync(CHAVES, { recursive: true });
  rodar('keytool', [
    '-genkeypair', '-v',
    '-storetype', 'PKCS12',
    '-keystore', KEYSTORE,
    '-alias', ALIAS,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-storepass', SENHA,
    '-keypass', SENHA,
    '-dname', 'CN=Claquete, OU=FIAP, O=Claquete, L=Sao Paulo, ST=SP, C=BR',
  ]);
}

// ------------------------------------------------------------------ prebuild

passo('Gerando o projeto nativo a partir do app.json');
const PACOTE = resolve(ROOT, 'package.json');
const scriptsAntes = JSON.parse(readFileSync(PACOTE, 'utf8')).scripts;

rodar('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install', '--clean']);

// O prebuild troca `expo start --android` por `expo run:android`. O README
// promete o caminho leve, pelo Expo Go, então os scripts voltam ao que eram.
const pacote = JSON.parse(readFileSync(PACOTE, 'utf8'));
pacote.scripts = scriptsAntes;
writeFileSync(PACOTE, `${JSON.stringify(pacote, null, 2)}\n`);

// ------------------------------------------------- configuração nativa do APK

passo('Aplicando a configuração de release');

writeFileSync(resolve(ANDROID, 'local.properties'), `sdk.dir=${SDK}\n`);
copyFileSync(KEYSTORE, resolve(ANDROID, 'app/claquete.keystore'));

const gradleApp = resolve(ANDROID, 'app/build.gradle');
let app = readFileSync(gradleApp, 'utf8');

const configDebug = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;
if (!app.includes(configDebug)) throw new Error('build.gradle mudou: a assinatura precisa ser revista');
app = app.replace(
  configDebug,
  `${configDebug.slice(0, -5)}    release {
            storeFile file(CLAQUETE_STORE_FILE)
            storePassword CLAQUETE_STORE_PASSWORD
            keyAlias CLAQUETE_KEY_ALIAS
            keyPassword CLAQUETE_KEY_PASSWORD
        }
    }`
);
app = app.replace(
  /            \/\/ Caution! In production[\s\S]*?signingConfig signingConfigs\.debug/,
  '            signingConfig signingConfigs.release'
);
writeFileSync(gradleApp, app);

const propriedades = resolve(ANDROID, 'gradle.properties');
let props = readFileSync(propriedades, 'utf8');
props = props.replace(
  'reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64',
  // arm64-v8a cobre qualquer celular Android atual e x86_64 cobre o emulador do
  // Android Studio. As duas arquiteturas de 32 bits dobrariam o tamanho do APK
  // para atender aparelhos que praticamente não existem mais.
  'reactNativeArchitectures=arm64-v8a,x86_64'
);
props += `
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
CLAQUETE_STORE_FILE=claquete.keystore
CLAQUETE_STORE_PASSWORD=${SENHA}
CLAQUETE_KEY_ALIAS=${ALIAS}
CLAQUETE_KEY_PASSWORD=${SENHA}
`;
writeFileSync(propriedades, props);

// --------------------------------------------------------------------- build

passo('Compilando (a primeira vez demora: o Gradle baixa tudo)');
rodar('./gradlew', ['assembleRelease', '--console=plain'], ANDROID);

const gerado = resolve(ANDROID, 'app/build/outputs/apk/release/app-release.apk');
mkdirSync(dirname(DESTINO), { recursive: true });
copyFileSync(gerado, DESTINO);

const mb = (statSync(DESTINO).size / 1024 / 1024).toFixed(0);
console.log(`\n✔ ${DESTINO.replace(`${ROOT}/`, '')}  ${mb} MB`);
