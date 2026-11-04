# Third-party notices / Atribuciones

## Local transcription / Transcripción local

- transcribe.cpp and its Rust bindings `transcribe-cpp` 0.4.1 (Handy Computer), with ggml: MIT.
  https://github.com/handy-computer/transcribe.cpp . Linked statically; Vulkan backend on Windows, Metal on macOS.
- Vulkan loader (`vulkan-1.dll`, provided by the graphics driver; import library from the LunarG Vulkan SDK): Apache-2.0.
- Models are not bundled; users download them from Hugging Face on demand:
  - Parakeet TDT 0.6B v3 (NVIDIA), CC-BY-4.0. GGUF conversion: `handy-computer/parakeet-tdt-0.6b-v3-gguf`.
  - Whisper large-v3-turbo (OpenAI), MIT. GGUF conversion: `handy-computer/whisper-large-v3-turbo-gguf`.
  - Silero VAD v6.2 (Silero Team), MIT. GGUF conversion: `handy-computer/silero-vad-v6.2-gguf`.
- The speech pipeline (VAD thresholds, release tail, minimum padding) follows Hex by Anomaly
  (https://github.com/anomalyco/hex), MIT. No Hex source is included.

## Other components / Otros componentes


- Rare UI folder: Swami Malode, MIT. Original license: `apps/desktop/vendor/LICENSE`.
  https://github.com/swamimalode07/rare-ui . Preserved source and adapted ControlledFolder.
- Grid Reveal: Swami Malode / [Rare UI](https://www.rareui.com/components/gridreveal),
  MIT + Commons Clause + Attribution (2026). Used inside Whispera, not as a component library.
  Source and full license retained in `apps/desktop/vendor/edge-drop/src/components/grid-reveal.tsx`
  and `grid-reveal.LICENSE`. Local changes adapt styling and pause hidden animations.
- Handy Pop and Marimba sounds: CJ Pais (2025), MIT. Full license distributed alongside sound files:
  `apps/desktop/public/sound-lab/HANDY-LICENSE.txt`. Sources and pinned revision in `SOURCES.md` there.
- Instrument Sans: SIL Open Font License 1.1, distributed by @fontsource-variable/instrument-sans.
- Lucide icons: ISC; React: MIT; Tauri: MIT/Apache-2.0; Motion: MIT; React Aria: Apache-2.0.
  npm and Cargo lockfiles identify exact dependency versions. Dependencies retain their own licenses.
- The repository owner's Mirel styles and frontend resource adaptations are included with explicit MIT
  redistribution authorization granted on 2026-09-18. Third-party upstream rights are not overridden.
- Original synthesized sound themes and the generated Cristal icon are project assets.

Before public release, review the complete dependency license inventory, including transitive packages.
This notice is attribution, not a claim that a complete legal audit has been performed.
# Screen recording

## Clipboard library

Edge Drop renderer: Deepender25, Apache-2.0, revision
469fd0d56d8d4073ed5a6fbcab36953db8203cae.
Source: https://github.com/Deepender25/Edge-Drop . License retained in
apps/desktop/vendor/edge-drop/LICENSE and distributed with library assets.
Whispera modifies filters, settings chrome and the native bridge.
Plus Jakarta Sans and JetBrains Mono fonts: SIL Open Font License 1.1.
Framer Motion and Zustand: MIT; GSAP: see its retained package license.
drag-rs 2.1.1: CrabNebula Ltd., MIT OR Apache-2.0.
Source: https://github.com/crabnebula-dev/drag-rs . No Electron runtime is launched.


The screen recorder launches FFmpeg as a separate executable, obtained through
`ffmpeg-static` 5.3.0. Its Windows binary is the Gyan.dev FFmpeg 6.1.1 essentials
build (GPL v3). Its license and build/source information are included alongside
the executable as `bin/ffmpeg.LICENSE` and `bin/ffmpeg.README`.
FFmpeg source revision: https://github.com/FFmpeg/FFmpeg/commit/e38092ef93
Binary distributor and corresponding build sources: https://www.gyan.dev/ffmpeg/builds/
Preserve these notices and review the binary's GPL redistribution requirements
before distributing an installer containing it.

`clipboard-win` 5.4.1 provides Windows file clipboard access (MIT OR Apache-2.0).
Source and license: https://github.com/DoumanAsh/clipboard-win
