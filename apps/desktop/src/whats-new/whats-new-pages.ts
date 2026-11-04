import type { WhatsNewMessageKey } from "./whats-new-messages";

/** Partes de Configuración a las que lleva el enlace de una página. */
export type WhatsNewSection = "transcription" | "appearance";

export type WhatsNewPageId = "local" | "setup" | "silence" | "capture" | "folder";

export interface WhatsNewPage {
  id: WhatsNewPageId;
  hues: readonly [number, number];
  link?: { label: WhatsNewMessageKey; section: WhatsNewSection };
}

/**
 * Las páginas de «Novedades» (la tarjeta de Kevin en Syka Legacy): un brillo
 * con su par de tonos y un dibujo por página. Al sacar una versión con
 * novedades nuevas, se cambian estas páginas y sus textos.
 */
export const WHATS_NEW_PAGES: readonly WhatsNewPage[] = [
  { id: "local", hues: [156, 244] },
  {
    id: "setup",
    hues: [204, 262],
    link: { label: "setup.link", section: "transcription" },
  },
  { id: "silence", hues: [24, 306] },
  { id: "capture", hues: [46, 296] },
  {
    id: "folder",
    hues: [292, 246],
    link: { label: "folder.link", section: "appearance" },
  },
];
