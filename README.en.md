<p align="center">
  <img src="apps/desktop/public/cristal/128x128.png" width="80" alt="Whispera" />
</p>

<h1 align="center">Whispera</h1>

<p align="center">
  Voice dictation, screenshots and screen recording for Windows and macOS (beta).<br/>
  Transcribes on your PC with a local model or in the cloud with Groq, and pastes the text where you are typing.
</p>

<p align="center">
  <a href="https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe"><kbd>Download for Windows</kbd></a>&ensp;·&ensp;
  <a href="README.md">Español</a>&ensp;·&ensp;
  <a href="docs/PRIVACY.md">Privacy</a>
</p>

<p align="center">The button downloads the Windows installer directly.<br/>If you already have Whispera, the update appears in <strong>Settings → Updates</strong>.</p>

## Downloads by platform

| Platform | Installer | Zipped app, no installer |
| --- | --- | --- |
| Windows stable | [EXE installer](https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe) | Not included |
| macOS 13+ · Apple Silicon · beta 5 | [DMG](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_aarch64.dmg) | [ZIP with Whispera.app](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_aarch64.app.zip) |
| macOS 13+ · Intel · beta 5 | [DMG](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_x86_64.dmg) | [ZIP with Whispera.app](https://github.com/SikJa/Whispera/releases/download/v0.3.0-beta.5/Whispera_0.3.0-beta.5_x86_64.app.zip) |

The macOS beta uses a separate update channel and does not include the local engine yet.
See [installation and permissions](docs/MACOS.md) and [the beta notes](docs/releases/0.3.0-beta.5.md).

---

<p align="center">
  <img src="docs/screenshots/recorder-active.png" width="360" alt="Floating recorder in action" />
  &emsp;
  <img src="docs/screenshots/settings-dark.png" width="420" alt="Settings panel" />
</p>

## What it is

Whispera is a desktop app that turns your voice into text. It appears as a floating folder
over any window: press the shortcut, speak, and the text is pasted into the field you were
typing in. It also includes a clipboard with history, screenshots with an editor and
region video recording.

It includes the work of Kazu's [Whispera-K](https://github.com/kazu00001/Whispera-K) fork,
with its history and credits.

## Two ways to transcribe

You pick the engine in the first-run guide and can change it anytime in **Settings → Transcription**.

| | Local | Groq |
|---|---|---|
| Where it runs | On your PC, on the graphics card (Vulkan) or the CPU | In Groq's cloud |
| Internet | Not needed | Required |
| Account | None | Your own key from [console.groq.com](https://console.groq.com/keys) |
| Audio leaves your computer | No | Yes, to Groq over HTTPS |
| Speed on a GTX 1660 Ti | 12 s of audio in about 0.3 s | Depends on your connection |
| Models | Parakeet v3 (740 MB) or Whisper large-v3-turbo (886 MB) | Whisper Large V3 and Turbo |

Local models are downloaded from the app only if you choose them, and are verified with
SHA-256 before use. **Parakeet v3** is the fastest and detects the language by itself.
**Whisper turbo** locks the language and handles very short phrases better.

With both engines:

- **Silero speech detector:** if you did not speak (a bump on the microphone, a click, room
  noise), nothing is transcribed, so no invented "Thank you" or "Ss." appears.
- **The ending is not clipped:** 200 ms more is recorded after you release the shortcut.
- **Personal dictionary:** names and terms corrected when transcribing.
- **Empty takes:** pressing by mistake without speaking keeps your last text.

## Features

| | |
|---|---|
| Floating folder | Colour, scale, control placement, 3D folder and animations |
| Pause and cancel | With confirmation and system audio restore |
| Transcribe files | Open an audio file and transcribe it without recording |
| History | Every transcript, editable and copyable |
| Clipboard | Text, links, images, videos and files; closes with a click outside |
| PNG screenshots | Native resolution, annotation editor, direct copy on release |
| Region video | MP4/H.264 at 30 FPS, system and/or microphone audio, double Esc to finish |
| Replay | Saves the last seconds of the screen, off by default |
| Shortcuts | Dictation, image, video and clipboard in Settings → Shortcuts |
| Start with Windows | Starts hidden in the tray |
| Recovery | Audio saved progressively and per-part retries |

The MP4 is copied as a file: pasting it with **Ctrl+V** depends on the target application
accepting files. [Capture and video guide](docs/SCREEN_RECORDING.md).

## Install on Windows

1. Download the [installer](https://github.com/SikJa/Whispera/releases/latest/download/Whispera-setup.exe).
2. Install for your user; no administrator rights needed.
3. The first time, a four-step guide opens:

| Step | What you do |
|:---:|---|
| 1. Privacy | See what happens to your audio with each engine |
| 2. Engine | Choose **Local** and install a model, or **Groq** and save your key (with an illustrated guide) |
| 3. Preferences | Microphone, language, shortcut, auto-paste and start with Windows |
| 4. Ready | See your shortcut; Whispera stays in the tray |

4. Click a text field, press the shortcut (`Ctrl+Shift+Space` by default), speak and press it again.

Local mode uses the graphics card when its driver has Vulkan (an up-to-date NVIDIA, AMD or
Intel driver); Whispera still opens without one and tells you if local mode cannot run.

<details>
<summary>How to get a Groq key, step by step</summary>

<br/>

**1. Create an account.** Go to [console.groq.com](https://console.groq.com) and sign up with Google or your email.

<img src="docs/groq-setup/01-login.png" width="520" alt="GroqCloud login page" />

**2. Open API Keys** from the navigation menu.

<img src="docs/groq-setup/02-api-keys.png" width="520" alt="Groq API Keys page" />

**3. Create a new key** with the **Create API Key** button.

<img src="docs/groq-setup/03-create-key.png" width="520" alt="Create API Key button" />

**4. Name it**, for example "Whispera", and confirm.

<img src="docs/groq-setup/04-name-key.png" width="520" alt="Dialog to name the API key" />

**5. Copy the key** and paste it into Whispera. It starts with `gsk_` and Groq shows it only once.

<img src="docs/groq-setup/05-copy-key.png" width="520" alt="Generated API key to copy" />

</details>

## What each user configures

| Setting | Required | Detail |
|---|:---:|---|
| Engine | Yes | Local (with an installed model) or Groq (with a key) |
| Groq key | Groq only | Stored in Windows Credential Manager, never in files |
| Local model | Local only | Parakeet v3 or Whisper turbo, downloaded from the app |
| Microphone | — | The Windows default or a chosen one |
| Shortcut | — | `Ctrl+Shift+Space` by default |
| Audio language | — | Spanish by default; English, Portuguese or automatic |
| Auto-paste | — | On by default |
| Start with Windows | — | Optional, starts in the tray |
| Dictionary | — | Empty at first |

## Privacy

- **Local:** audio is processed on your PC and never leaves your computer.
- **Groq:** audio and dictionary vocabulary are sent to Groq over HTTPS with your account.
- The Groq key is stored in Windows Credential Manager.
- Local data in `%APPDATA%\app.whispera.desktop.preview` and models in `%USERPROFILE%\.whispera\desktop\models`.
- There is no Whispera server: no analytics, no telemetry, no account.

More in [docs/PRIVACY.md](docs/PRIVACY.md).

## Development

Requirements: Windows, Node.js 22+, Rust stable (MSVC), C++ Build Tools, WebView2,
[CMake](https://cmake.org) and the [Vulkan SDK](https://vulkan.lunarg.com) to build the local engine.

```bash
cd apps/desktop
npm ci
npm ci --ignore-scripts --prefix vendor/edge-drop
npm run build          # includes the clipboard renderer
npm run desktop        # development with reload
```

```bash
npm run tauri build -- --bundles nsis    # installer
cd src-tauri && cargo test --locked      # Rust tests
```

`VULKAN_SDK` must point to the installed SDK (for example `C:\VulkanSDK\1.4.363.0`).
The installer is written to `src-tauri/target/release/bundle/nsis/`.

Release tests run with `npx playwright install chromium` and `npm run test:release` after
building. They use mocked IPC and synthetic files: they do not test the real microphone or
pasting into other applications.

## License

MIT, see [LICENSE](LICENSE). Third-party attributions, including the local models, are in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
