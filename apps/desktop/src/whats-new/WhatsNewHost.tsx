import { useEffect } from "react";
import SykaWhatsNew from "./SykaWhatsNew";
import { closeWhatsNew, openWhatsNew, shouldShowWhatsNew, useWhatsNew } from "./whats-new-store";
import type { WhatsNewSection } from "./whats-new-pages";

/**
 * Abre «Novedades» sola ~0,9 s después de mostrarse Configuración, la primera vez
 * con cada versión instalada. Whispera arranca en la bandeja, así que la primera
 * vez es cuando se abre la ventana después de actualizar.
 */
export function WhatsNewHost({ version, onOpenSettings }: { version: string; onOpenSettings: (section: WhatsNewSection) => void }) {
  const { open, session } = useWhatsNew();
  useEffect(() => {
    if (!shouldShowWhatsNew(version)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(timer);
      if (!document.hidden && shouldShowWhatsNew(version)) timer = setTimeout(() => openWhatsNew(version), 900);
    };
    arm();
    document.addEventListener("visibilitychange", arm);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", arm); };
  }, [version]);
  return <SykaWhatsNew key={session} open={open} onClose={closeWhatsNew} onOpenSettings={onOpenSettings} />;
}
