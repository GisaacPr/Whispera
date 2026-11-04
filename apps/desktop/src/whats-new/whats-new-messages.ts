import {
  defineMessages,
  type MessageCatalog,
} from "./whats-new-i18n";

const WHATS_NEW_MESSAGES = {
  en: {
    title: "What's new in Whispera",
    next: "Next",
    back: "Back",
    notNow: "Not now",
    start: "Get started",
    close: "Close",
    pages: "Highlights",
    goTo: "Go to {title}",
    progress: "{current} of {total}",

    "local.title": "Transcribe on your PC",
    "local.body":
      "A local model turns your voice into text on this computer, without internet or a Groq key. Your audio never leaves it.",
    "setup.title": "Choose your engine",
    "setup.body":
      "Setup now lets you start with Local or Groq. Install Parakeet v3 or Whisper turbo right there and change it whenever you want.",
    "setup.link": "Open Transcription",
    "silence.title": "No more phantom “Thank you”",
    "silence.body":
      "A speech detector throws away bumps, clicks and room noise before transcribing, and the last word is no longer cut off.",
    "capture.title": "Smoother captures",
    "capture.body":
      "Kazu reworked captures and recordings: a thin border visible on any background, video that looks like the capture and no blinking.",
    "folder.title": "Your folder, your colour",
    "folder.body":
      "The 3D folder takes the colour you choose, animates while you record and reacts at once to the shortcut.",
    "folder.link": "Open Appearance",

    "art.dictated": "This is transcribed on your PC without internet",
    "art.engineChip": "Parakeet · local",
    "art.accountWork": "Local",
    "art.accountWorkMeta": "Parakeet v3 · on your PC",
    "art.accountPersonal": "Groq",
    "art.accountPersonalMeta": "Whisper · in the cloud",
    "art.accountEngine": "Whisper turbo",
    "art.accountEngineMeta": "Local · fixed language",
    "art.accountInUse": "In use",
    "art.listening": "Listening",
    "art.bump": "bump on the microphone",
    "art.detector": "Speech detector",
    "art.noVoice": "no voice",
    "art.dropped": "Discarded",
    "art.nothingSent": "Nothing was sent",
    "art.captures": "Captures",
    "art.newCapture": "New capture",
    "art.thinBorder": "Thin border",
    "art.thinBorderBody": "Visible on any background",
    "art.videoLikeImage": "Video like the capture",
    "art.videoLikeImageBody": "Records on the graphics card",
    "art.original": "Original",
    "art.folder3d": "3D",
    "art.metallic": "Metallic",
    "art.folderColour": "Folder colour",
    "art.scale": "Scale",
    "art.animations": "Animations",
  },
  es: {
    title: "Novedades de Whispera",
    next: "Siguiente",
    back: "Atrás",
    notNow: "Ahora no",
    start: "Empezar",
    close: "Cerrar",
    pages: "Novedades",
    goTo: "Ir a {title}",
    progress: "{current} de {total}",

    "local.title": "Transcribí en tu PC",
    "local.body":
      "Un modelo local convierte tu voz en texto en esta computadora, sin internet ni clave de Groq. El audio no sale de tu equipo.",
    "setup.title": "Elegí tu motor",
    "setup.body":
      "La guía inicial ahora te deja empezar con Local o con Groq. Instalás Parakeet v3 o Whisper turbo ahí mismo y lo cambiás cuando quieras.",
    "setup.link": "Abrir Transcripción",
    "silence.title": "Chau “Gracias” fantasma",
    "silence.body":
      "Un detector de voz descarta golpes, clics y ruido antes de transcribir, y ya no se corta la última palabra.",
    "capture.title": "Capturas más fluidas",
    "capture.body":
      "Kazu renovó capturas y grabaciones: borde fino visible en cualquier fondo, video igual que la captura y sin parpadeos.",
    "folder.title": "Tu carpeta, tu color",
    "folder.body":
      "La carpeta 3D toma el color que elijas, se anima mientras grabás y reacciona al instante al atajo.",
    "folder.link": "Abrir Apariencia",

    "art.dictated": "Esto se transcribe en tu PC sin internet",
    "art.engineChip": "Parakeet · local",
    "art.accountWork": "Local",
    "art.accountWorkMeta": "Parakeet v3 · en tu PC",
    "art.accountPersonal": "Groq",
    "art.accountPersonalMeta": "Whisper · en la nube",
    "art.accountEngine": "Whisper turbo",
    "art.accountEngineMeta": "Local · idioma fijo",
    "art.accountInUse": "En uso",
    "art.listening": "Escuchando",
    "art.bump": "golpe en el micrófono",
    "art.detector": "Detector de voz",
    "art.noVoice": "sin voz",
    "art.dropped": "Descartado",
    "art.nothingSent": "No se envió nada",
    "art.captures": "Capturas",
    "art.newCapture": "Nueva captura",
    "art.thinBorder": "Borde fino",
    "art.thinBorderBody": "Visible en cualquier fondo",
    "art.videoLikeImage": "Video como la captura",
    "art.videoLikeImageBody": "Graba con la placa de video",
    "art.original": "Original",
    "art.folder3d": "3D",
    "art.metallic": "Metálica",
    "art.folderColour": "Color de la carpeta",
    "art.scale": "Escala",
    "art.animations": "Animaciones",
  },
} as const satisfies MessageCatalog;

export type WhatsNewMessageKey = Extract<keyof (typeof WHATS_NEW_MESSAGES)["en"], string>;

export const useWhatsNewMessages = defineMessages(WHATS_NEW_MESSAGES);
