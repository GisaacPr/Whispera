<p align="center">
  <img src="apps/desktop/public/cristal/128x128.png" width="80" alt="Whispera" />
</p>

<h1 align="center">Whispera</h1>

<p align="center">
  Dictado por voz, capturas y grabación de pantalla para Windows y macOS (beta).<br/>
  Transcribe en tu PC con un modelo local o en la nube con Groq, y pega el texto donde estás escribiendo.
</p>

<p align="center">
  <a href="https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe"><kbd>Descargar para Windows</kbd></a>&ensp;·&ensp;
  <a href="README.en.md">English</a>&ensp;·&ensp;
  <a href="docs/PRIVACY.md">Privacidad</a>
</p>

<p align="center">El botón descarga directamente el instalador para Windows.<br/>Si ya tenés Whispera, la actualización aparece en <strong>Configuración → Actualizaciones</strong>.</p>

## Descargas por sistema

| Sistema | Instalador | App comprimida, sin instalador |
| --- | --- | --- |
| Windows estable | [Instalador EXE](https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe) | No incluida |
| macOS 13+ · Apple Silicon · beta 5 | [DMG](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_aarch64.dmg) | [ZIP con Whispera.app](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_aarch64.app.zip) |
| macOS 13+ · Intel · beta 5 | [DMG](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_x86_64.dmg) | [ZIP con Whispera.app](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_x86_64.app.zip) |

La beta de macOS usa un canal de actualizaciones separado y todavía no incluye el motor local.
Consultá [instalación y permisos](docs/MACOS.md) y [las notas de la beta](docs/releases/0.3.0-beta.5.md).

---

<p align="center">
  <img src="docs/screenshots/recorder-active.png" width="360" alt="Grabadora flotante en acción" />
  &emsp;
  <img src="docs/screenshots/settings-dark.png" width="420" alt="Panel de configuración" />
</p>

## Qué es

Whispera es una app de escritorio que convierte tu voz en texto. Aparece como una carpeta
flotante sobre cualquier ventana: pulsás el atajo, hablás, y el texto se pega en el campo
donde estabas escribiendo. Además trae portapapeles con historial, capturas con editor y
grabación de video por región.

Incluye el trabajo del fork [Whispera-K](https://github.com/kazu00001/Whispera-K) de Kazu,
con su historial y créditos.

## Dos formas de transcribir

Elegís el motor en la guía inicial y lo cambiás cuando quieras en **Configuración → Transcripción**.

| | Local | Groq |
|---|---|---|
| Dónde corre | En tu PC, con la placa de video (Vulkan) o el procesador | En la nube de Groq |
| Internet | No hace falta | Necesaria |
| Cuenta | Ninguna | Tu propia clave de [console.groq.com](https://console.groq.com/keys) |
| El audio sale de tu equipo | No | Sí, a Groq por HTTPS |
| Velocidad en una GTX 1660 Ti | 12 s de audio en unos 0,3 s | Depende de la conexión |
| Modelos | Parakeet v3 (740 MB) o Whisper large-v3-turbo (886 MB) | Whisper Large V3 y Turbo |

Los modelos locales se descargan desde la app solo si los elegís, y se verifican con SHA-256
antes de usarse. **Parakeet v3** es el más rápido y detecta el idioma solo. **Whisper turbo**
fija el idioma y anda mejor en frases muy cortas.

En los dos motores:

- **Detector de voz Silero:** si no hablaste (un golpe al micrófono, un clic, ruido de fondo),
  no se transcribe nada. Así no aparecen "Gracias" ni "Ss." inventados.
- **El final no se corta:** se graban 200 ms más después de soltar el atajo.
- **Diccionario personal:** nombres y términos que se corrigen al transcribir.
- **Dictado vacío:** si apretás sin querer y no hablás, se conserva tu último texto.

## Características

| | |
|---|---|
| Carpeta flotante | Color, escala, posición de controles, carpeta 3D y animaciones |
| Pausa y cancelación | Con confirmación y restauración del audio del sistema |
| Transcribir archivos | Abrís un audio y lo transcribís sin grabar |
| Historial | Todas tus transcripciones, editables y copiables |
| Portapapeles | Texto, enlaces, imágenes, videos y archivos; se cierra con un clic afuera |
| Capturas PNG | Resolución nativa, editor con anotaciones, copia directa al soltar |
| Video por región | MP4/H.264 a 30 FPS, audio de la PC y/o micrófono, doble Esc para terminar |
| Replay | Guarda los últimos segundos de la pantalla, apagado por defecto |
| Atajos | Dictado, imagen, video y portapapeles en Configuración → Atajos |
| Inicio con Windows | Arranca oculto en la bandeja |
| Recuperación | Audio guardado de a poco y reintentos por fragmento |

El MP4 se copia como archivo: pegarlo con **Ctrl+V** depende de que la aplicación de destino
acepte archivos. [Guía de capturas y video](docs/SCREEN_RECORDING.md).

## Instalar en Windows

1. Descargá el [instalador](https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe).
2. Instalá para tu usuario; no necesita permisos de administrador.
3. La primera vez se abre una guía de cuatro pasos:

| Paso | Qué hacés |
|:---:|---|
| 1. Privacidad | Ves qué pasa con tu audio en cada motor |
| 2. Motor | Elegís **Local** e instalás un modelo, o **Groq** y guardás tu clave (con guía ilustrada) |
| 3. Preferencias | Micrófono, idioma, atajo, pegado automático e inicio con Windows |
| 4. Listo | Ves tu atajo y Whispera queda en la bandeja |

4. Hacé clic en un campo de texto, pulsá el atajo (`Ctrl+Shift+Space` por defecto), hablá y pulsalo otra vez.

El modo local usa la placa de video si tiene un driver con Vulkan (NVIDIA, AMD o Intel
actualizado); Whispera abre igual en equipos sin driver y te avisa si el modo local no puede correr.

<details>
<summary>Cómo obtener una clave de Groq, paso a paso</summary>

<br/>

**1. Crear una cuenta.** Entrá a [console.groq.com](https://console.groq.com) y registrate con Google o tu email.

<img src="docs/groq-setup/01-login.png" width="520" alt="Página de login de GroqCloud" />

**2. Ir a API Keys** desde el menú de navegación.

<img src="docs/groq-setup/02-api-keys.png" width="520" alt="Página de API Keys en Groq" />

**3. Crear una nueva clave** con el botón **Create API Key**.

<img src="docs/groq-setup/03-create-key.png" width="520" alt="Botón Create API Key" />

**4. Ponerle un nombre**, por ejemplo "Whispera", y confirmar.

<img src="docs/groq-setup/04-name-key.png" width="520" alt="Diálogo para nombrar la API Key" />

**5. Copiar la clave** y pegarla en Whispera. Empieza con `gsk_` y Groq la muestra una sola vez.

<img src="docs/groq-setup/05-copy-key.png" width="520" alt="Clave API generada para copiar" />

</details>

## Qué configura cada persona

| Ajuste | Obligatorio | Detalle |
|---|:---:|---|
| Motor | Sí | Local (con un modelo instalado) o Groq (con clave) |
| Clave de Groq | Solo con Groq | Se guarda en Windows Credential Manager, nunca en archivos |
| Modelo local | Solo con Local | Parakeet v3 o Whisper turbo, se descarga desde la app |
| Micrófono | — | El predeterminado de Windows o uno elegido |
| Atajo | — | `Ctrl+Shift+Space` por defecto |
| Idioma del audio | — | Español por defecto; inglés, portugués o automático |
| Pegado automático | — | Activado por defecto |
| Inicio con Windows | — | Opcional, arranca en la bandeja |
| Diccionario | — | Vacío al empezar |

## Privacidad

- **Local:** el audio se procesa en tu PC y no sale de tu equipo.
- **Groq:** el audio y el vocabulario del diccionario se envían a Groq por HTTPS con tu cuenta.
- La clave de Groq se guarda en Windows Credential Manager.
- Datos locales en `%APPDATA%\app.whispera.desktop.preview` y modelos en `%USERPROFILE%\.whispera\desktop\models`.
- No hay servidor de Whispera: sin analíticas, sin telemetría, sin cuenta.

Más información en [docs/PRIVACY.md](docs/PRIVACY.md).

## Desarrollo

Requisitos: Windows, Node.js 22+, Rust stable (MSVC), C++ Build Tools, WebView2,
[CMake](https://cmake.org) y el [Vulkan SDK](https://vulkan.lunarg.com) para compilar el motor local.

```bash
cd apps/desktop
npm ci
npm ci --ignore-scripts --prefix vendor/edge-drop
npm run build          # incluye el renderer del portapapeles
npm run desktop        # desarrollo con recarga
```

```bash
npm run tauri build -- --bundles nsis    # instalador
cd src-tauri && cargo test --locked      # pruebas de Rust
```

`VULKAN_SDK` tiene que apuntar al SDK instalado (por ejemplo `C:\VulkanSDK\1.4.363.0`).
El instalador queda en `src-tauri/target/release/bundle/nsis/`.

Las pruebas de publicación corren con `npx playwright install chromium` y
`npm run test:release` después de compilar. Usan IPC simulado y archivos sintéticos:
no prueban el micrófono real ni el pegado en otras aplicaciones.

## Licencia

MIT, ver [LICENSE](LICENSE). Atribuciones de terceros, incluidos los modelos locales,
en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
