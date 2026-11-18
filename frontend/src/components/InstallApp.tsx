"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "studio.install.dismissed";

function isStandalone(): boolean {
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iosDevice = /iphone|ipad|ipod/i.test(ua);
  const ipadDesktop = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return (iosDevice || ipadDesktop) && !/crios|fxios|edgios/i.test(ua);
}

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  // Starts hidden: installed apps and dismissed banners must not flash on load.
  const [blocked, setBlocked] = useState(true);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const visible = !blocked && Boolean(promptEvent || iosHint);

  useEffect(() => {
    setBlocked(isStandalone() || window.localStorage.getItem(DISMISS_KEY) === "1");
    setIosHint(isIosSafari());

    function onBeforeInstall(event: Event) {
      // Chrome only fires this when the page is actually installable.
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    }
    function onInstalled() {
      setPromptEvent(null);
      setBlocked(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Reserve page space only while the banner is on screen, using its real height.
  useEffect(() => {
    const banner = bannerRef.current;
    if (!visible || !banner) return;
    const root = document.documentElement;
    const update = () => {
      const rect = banner.getBoundingClientRect();
      const offset = Math.max(0, Math.round(window.innerHeight - rect.bottom));
      root.style.setProperty("--install-banner-space", `${Math.ceil(rect.height + offset)}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(banner);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--install-banner-space");
    };
  }, [visible]);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") setBlocked(true);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setBlocked(true);
  }

  const announcement = !visible
    ? ""
    : promptEvent
      ? "Możesz zainstalować Emergent Studio. Na dole strony jest przycisk Zainstaluj aplikację."
      : "Emergent Studio możesz dodać do ekranu początkowego: Udostępnij → Dodaj do ekranu początkowego.";

  return (
    <>
      {/* Stays mounted so assistive tech announces the banner when it appears. */}
      <p role="status" lang="pl" className="sr-only">
        {announcement}
      </p>

      {visible ? (
        <div
          ref={bannerRef}
          role="region"
          aria-label="Zainstaluj aplikację"
          lang="pl"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-zinc-700 bg-[#0b0b12]/95 p-3 shadow-2xl shadow-black/60 backdrop-blur sm:bottom-6"
        >
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500">
            <Download aria-hidden="true" className="h-4 w-4 text-white" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-100">Zainstaluj Emergent Studio</p>
            {promptEvent ? (
              <p className="text-[11px] text-zinc-400">Ikona na ekranie głównym, otwiera się w osobnym oknie.</p>
            ) : (
              <p className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                <Share aria-hidden="true" className="h-3 w-3 shrink-0" /> Share → Add to Home Screen
              </p>
            )}
          </div>

          {promptEvent ? (
            <button
              type="button"
              onClick={() => void install()}
              className="min-h-10 shrink-0 rounded-lg bg-indigo-600 px-3.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Zainstaluj aplikację
            </button>
          ) : null}

          <button
            type="button"
            onClick={dismiss}
            aria-label="Zamknij komunikat o instalacji"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}
