import assert from "node:assert/strict";
import { afterEach, before, beforeEach, it } from "node:test";
import React, { act } from "react";
import type { Root } from "react-dom/client";
import { JSDOM, type DOMWindow } from "jsdom";

type InstallAppComponent = typeof import("../src/components/InstallApp").default;

const DISMISS_KEY = "studio.install.dismissed";

const dom = new JSDOM('<!doctype html><html lang="pl"><body></body></html>', {
  url: "https://studio.test/",
  pretendToBeVisual: true,
});

const win = dom.window as unknown as DOMWindow & typeof globalThis;

let InstallApp: InstallAppComponent;
let createRoot: typeof import("react-dom/client").createRoot;

let host: HTMLDivElement;
let root: Root | null = null;

function installBrowserGlobals() {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(win, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
  Object.assign(win, { ResizeObserver: ResizeObserverStub });

  const globals = globalThis as unknown as Record<string, unknown>;
  globals.window = win;
  globals.document = win.document;
  globals.HTMLElement = win.HTMLElement;
  globals.Node = win.Node;
  globals.Event = win.Event;
  globals.MouseEvent = win.MouseEvent;
  globals.ResizeObserver = ResizeObserverStub;
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  // Node ships a read-only global navigator, so it has to be redefined.
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: win.navigator });
}

async function mount() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(React.createElement(InstallApp));
  });
  return host;
}

async function unmount() {
  if (!root) return;
  const current = root;
  root = null;
  await act(async () => {
    current.unmount();
  });
  host.remove();
}

async function dispatch(event: Event) {
  await act(async () => {
    win.dispatchEvent(event);
  });
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
}

function installPrompt() {
  const event = new win.Event("beforeinstallprompt", { cancelable: true });
  Object.assign(event, {
    prompt: async () => {},
    userChoice: Promise.resolve({ outcome: "dismissed" }),
  });
  return event;
}

function region() {
  return host.querySelector('[role="region"]');
}

function announcement() {
  return host.querySelector('[role="status"]')?.textContent?.trim() ?? "";
}

before(async () => {
  installBrowserGlobals();
  ({ createRoot } = await import("react-dom/client"));
  InstallApp = (await import("../src/components/InstallApp")).default;
});

beforeEach(() => {
  win.localStorage.clear();
});

afterEach(async () => {
  await unmount();
  win.localStorage.clear();
});

it("shows the banner and its live announcement after beforeinstallprompt", async () => {
  await mount();
  assert.equal(region(), null, "banner must stay hidden until Chrome reports installability");
  assert.equal(announcement(), "");

  await dispatch(installPrompt());

  const banner = region();
  assert.ok(banner, "banner should appear once the page is installable");
  assert.equal(banner.getAttribute("aria-label"), "Zainstaluj aplikację");
  assert.equal(banner.getAttribute("lang"), "pl");
  assert.match(host.textContent ?? "", /Zainstaluj aplikację/, "banner exposes the install action");

  const live = host.querySelector('[role="status"]');
  assert.ok(live, "the live region must be mounted from the first render");
  assert.equal(live.getAttribute("lang"), "pl");
  assert.match(announcement(), /Możesz zainstalować Emergent Studio/);
});

it("hides the banner and clears the announcement after appinstalled", async () => {
  await mount();
  await dispatch(installPrompt());
  assert.ok(region());

  await dispatch(new win.Event("appinstalled"));

  assert.equal(region(), null, "an installed app must not keep offering installation");
  assert.equal(announcement(), "", "the live region must not leave a stale prompt");
});

it("keeps a dismissal for later visits without stealing footer space", async () => {
  await mount();
  await dispatch(installPrompt());
  assert.ok(region());

  const close = host.querySelector<HTMLButtonElement>('button[aria-label="Zamknij komunikat o instalacji"]');
  assert.ok(close, "dismiss control needs an accessible name");
  await click(close);

  assert.equal(win.localStorage.getItem(DISMISS_KEY), "1");
  assert.equal(region(), null);
  assert.equal(win.document.documentElement.style.getPropertyValue("--install-banner-space"), "");

  await unmount();
  await mount();
  assert.equal(announcement(), "", "a dismissed banner stays quiet on the next visit");

  await dispatch(installPrompt());
  assert.equal(region(), null, "once dismissed, the banner must not come back");
});
