import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./whats-new-icon";
import { WhatsNewArt } from "./WhatsNewArt";
import { useWhatsNewMessages } from "./whats-new-messages";
import { WHATS_NEW_PAGES, type WhatsNewPage, type WhatsNewSection } from "./whats-new-pages";

import "./whats-new.css";
import "./whispera-whats-new.css";

const SWIPE_DISTANCE = 44;
const LAST_INDEX = WHATS_NEW_PAGES.length - 1;

interface Paging {
  index: number;
  direction: "forward" | "back";
}

interface SwipeStart {
  pointerId: number;
  x: number;
  y: number;
}

function pageAt(index: number): WhatsNewPage {
  const page = WHATS_NEW_PAGES[index] ?? WHATS_NEW_PAGES[0];
  if (page === undefined) throw new Error("What's new has no pages");
  return page;
}

export default function SykaWhatsNew({
  open,
  onClose,
  onOpenSettings,
}: {
  open: boolean;
  onClose: () => void;
  /** El enlace de una página: abre esa parte de Ajustes. */
  onOpenSettings: (section: WhatsNewSection) => void;
}) {
  const t = useWhatsNewMessages();
  const [paging, setPaging] = useState<Paging>({
    index: 0,
    direction: "forward",
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<SwipeStart | null>(null);
  const page = pageAt(paging.index);
  const isFirst = paging.index === 0;
  const isLast = paging.index === LAST_INDEX;
  const link = page.link;

  function goTo(index: number) {
    setPaging((current) => {
      const next = Math.min(Math.max(index, 0), LAST_INDEX);
      if (next === current.index) return current;
      return {
        index: next,
        direction: next > current.index ? "forward" : "back",
      };
    });
  }

  function advance() {
    if (isLast) onClose();
    else goTo(paging.index + 1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    if (event.key === "Enter" && event.target === event.currentTarget) {
      event.preventDefault();
      advance();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(paging.index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(paging.index - 1);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    swipeRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (start === null || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }
    goTo(paging.index + (dx < 0 ? 1 : -1));
  }

  // El `Dialog` de Syka Legacy (Radix) como diálogo propio: centrado sobre la
  // ventana, Esc y un clic afuera lo cierran, y el foco entra a la tarjeta.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    contentRef.current?.focus({ preventScroll: true });
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onEscape);
    return () => { window.removeEventListener("keydown", onEscape); previous?.focus?.({ preventScroll: true }); };
  }, [open]);
  if (!open) return null;
  const titleId = "whispera-whats-new-title", textId = "whispera-whats-new-text";
  return createPortal(
    <div className="dark whispera-wn-root">
      <div className="whispera-wn-overlay" onClick={onClose} />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        tabIndex={-1}
        className="syka-wn at-animate-pop fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        data-testid="syka-whats-new"
        onKeyDown={handleKeyDown}
      >
        <div
          className="syka-wn-stage"
          data-direction={paging.direction}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
        >
          <div
            className="syka-wn-hero"
            data-page={page.id}
            style={
              {
                "--syka-wn-ha": page.hues[0],
                "--syka-wn-hb": page.hues[1],
              } as CSSProperties
            }
          >
            <div className="syka-wn-glow" aria-hidden>
              <span data-blob="a" />
              <span data-blob="b" />
              <span data-blob="c" />
            </div>
            <div
              key={page.id}
              className="syka-wn-art"
              data-art={page.id}
              aria-hidden
            >
              <WhatsNewArt page={page.id} />
            </div>
            <button
              type="button"
              className="syka-wn-close"
              aria-label={t("close")}
              onClick={onClose}
            >
              <Icon name="X" aria-hidden />
            </button>
          </div>
          <div className="syka-wn-body">
            <h2 id={titleId} className="syka-wn-eyebrow">{t("title")}</h2>
            <div className="syka-wn-copy" aria-live="polite">
              <div key={page.id} className="syka-wn-copy-page">
                <h3 className="syka-wn-heading">{t(`${page.id}.title`)}</h3>
                <p id={textId} className="syka-wn-text">
                  {t(`${page.id}.body`)}
                </p>
                <span className="sr-only">
                  {t("progress", {
                    current: paging.index + 1,
                    total: WHATS_NEW_PAGES.length,
                  })}
                </span>
                {link === undefined ? null : (
                  <button
                    type="button"
                    className="syka-wn-link"
                    onClick={() => {
                      onClose();
                      onOpenSettings(link.section);
                    }}
                  >
                    {t(link.label)}
                    <Icon name="ArrowRight" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="syka-wn-footer">
          <div className="syka-wn-dots" role="group" aria-label={t("pages")}>
            {WHATS_NEW_PAGES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="syka-wn-dot"
                aria-label={t("goTo", { title: t(`${item.id}.title`) })}
                aria-current={index === paging.index ? "step" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="syka-wn-primary"
            onClick={advance}
          >
            {isLast ? t("start") : t("next")}
          </button>
          <button
            type="button"
            className="syka-wn-secondary"
            onClick={() => (isFirst ? onClose() : goTo(paging.index - 1))}
          >
            {isFirst ? t("notNow") : t("back")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
