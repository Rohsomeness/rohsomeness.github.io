import type { PanelPayload } from "../../content/types";

export type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  interactPressed: boolean;
};

const input: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  interact: false,
  interactPressed: false,
};

let panelOpen = false;
let helpOpen = false;
let nearestPrompt = "";

export function isUiBlocking(): boolean {
  return panelOpen || helpOpen;
}

export function getInput(): InputState {
  return input;
}

export function consumeInteractPress(): boolean {
  if (input.interactPressed) {
    input.interactPressed = false;
    return true;
  }
  return false;
}

export function setZoneLabel(text: string): void {
  const el = document.getElementById("zone-label");
  if (el) el.textContent = text;
}

export function setPrompt(text: string | null): void {
  const el = document.getElementById("prompt");
  if (!el) return;
  if (!text || panelOpen) {
    el.classList.add("hidden");
    nearestPrompt = "";
    return;
  }
  nearestPrompt = text;
  el.textContent = text;
  el.classList.remove("hidden");
}

export function openPanel(payload: PanelPayload): void {
  const panel = document.getElementById("panel");
  const title = document.getElementById("panel-title");
  const meta = document.getElementById("panel-meta");
  const body = document.getElementById("panel-body");
  const links = document.getElementById("panel-links");
  if (!panel || !title || !meta || !body || !links) return;

  title.textContent = payload.title;
  meta.textContent = payload.meta ?? "";
  meta.style.display = payload.meta ? "block" : "none";
  body.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = payload.body;
  body.appendChild(p);

  if (payload.tags?.length) {
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const t of payload.tags) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tags.appendChild(span);
    }
    body.appendChild(tags);
  }

  links.innerHTML = "";
  for (const link of payload.links ?? []) {
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.label;
    links.appendChild(a);
  }

  panel.classList.remove("hidden");
  panelOpen = true;
  setPrompt(null);
}

export function closePanel(): void {
  document.getElementById("panel")?.classList.add("hidden");
  panelOpen = false;
}

export function openHelp(): void {
  document.getElementById("help-overlay")?.classList.remove("hidden");
  helpOpen = true;
}

export function closeHelp(): void {
  document.getElementById("help-overlay")?.classList.add("hidden");
  helpOpen = false;
}

function bindKey(code: string, on: boolean): void {
  switch (code) {
    case "ArrowUp":
    case "KeyW":
      input.up = on;
      break;
    case "ArrowDown":
    case "KeyS":
      input.down = on;
      break;
    case "ArrowLeft":
    case "KeyA":
      input.left = on;
      break;
    case "ArrowRight":
    case "KeyD":
      input.right = on;
      break;
    case "KeyE":
    case "Space":
    case "Enter":
      if (on && !input.interact) input.interactPressed = true;
      input.interact = on;
      break;
    case "Escape":
      if (on) {
        if (panelOpen) closePanel();
        else if (helpOpen) closeHelp();
      }
      break;
    case "KeyH":
    case "Slash":
      if (on && !panelOpen) {
        if (helpOpen) closeHelp();
        else openHelp();
      }
      break;
  }
}

export function initDomUi(): void {
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    bindKey(e.code, true);
  });
  window.addEventListener("keyup", (e) => bindKey(e.code, false));

  document.getElementById("panel-close")?.addEventListener("click", () => closePanel());
  document.getElementById("panel")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closePanel();
  });
  document.getElementById("help-btn")?.addEventListener("click", () => openHelp());
  document.getElementById("help-close")?.addEventListener("click", () => closeHelp());
  document.getElementById("help-overlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeHelp();
  });

  const mobile = document.getElementById("mobile-controls");
  const coarse =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches;
  if (mobile && coarse) {
    mobile.classList.remove("hidden");
    mobile.setAttribute("aria-hidden", "false");
  }

  const setDir = (dir: string, on: boolean) => {
    if (dir === "up") input.up = on;
    if (dir === "down") input.down = on;
    if (dir === "left") input.left = on;
    if (dir === "right") input.right = on;
  };

  mobile?.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((btn) => {
    const dir = btn.dataset.dir!;
    const start = (e: Event) => {
      e.preventDefault();
      setDir(dir, true);
    };
    const end = (e: Event) => {
      e.preventDefault();
      setDir(dir, false);
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointerleave", end);
    btn.addEventListener("pointercancel", end);
  });

  const a = document.getElementById("btn-a");
  a?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    input.interact = true;
    input.interactPressed = true;
  });
  a?.addEventListener("pointerup", (e) => {
    e.preventDefault();
    input.interact = false;
  });
  a?.addEventListener("pointercancel", () => {
    input.interact = false;
  });

  // Show mobile controls after first touch as fallback
  window.addEventListener(
    "touchstart",
    () => {
      if (mobile) {
        mobile.classList.remove("hidden");
        mobile.setAttribute("aria-hidden", "false");
      }
    },
    { once: true },
  );
}

export function getNearestPrompt(): string {
  return nearestPrompt;
}
