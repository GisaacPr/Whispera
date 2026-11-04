/**
 * «Novedades» (de Syka Legacy): si está abierta y si ya se vio la de la versión
 * instalada. Se ve una vez por versión; Actualizaciones › Ver novedades la
 * vuelve a abrir.
 */
import { useSyncExternalStore } from "react";

export const WHATS_NEW_STORAGE_KEY = "whispera.whatsNew.seen";

interface WhatsNewState {
  readonly open: boolean;
  /** Cada apertura monta la tarjeta de cero (vuelve a la primera página). */
  readonly session: number;
  readonly version: string;
}

let state: WhatsNewState = { open: false, session: 0, version: "" };
const listeners = new Set<() => void>();
function set(next: Partial<WhatsNewState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function useWhatsNew(): WhatsNewState {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => state,
  );
}

export function shouldShowWhatsNew(version: string): boolean {
  if (!version) return false;
  try {
    return localStorage.getItem(WHATS_NEW_STORAGE_KEY) !== version;
  } catch {
    return false;
  }
}

export function openWhatsNew(version = state.version): void {
  if (!state.open) set({ open: true, session: state.session + 1, version });
}

export function closeWhatsNew(): void {
  try {
    if (state.version) localStorage.setItem(WHATS_NEW_STORAGE_KEY, state.version);
  } catch {
    // Sin almacenamiento solo vuelve a salir la próxima vez.
  }
  set({ open: false });
}
