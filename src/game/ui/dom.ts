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
/** Called on Escape when no panel/help is open (e.g. return to hub). */
let escapeToHome: (() => void) | null = null;

export function isUiBlocking(): boolean {
  return panelOpen || helpOpen;
}

/** Register scene-level Escape behavior (return home). Pass null to clear. */
export function setEscapeToHome(handler: (() => void) | null): void {
  escapeToHome = handler;
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

/** Clear stuck movement keys (e.g. after scene change). */
export function clearMovementInput(): void {
  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;
  input.interact = false;
  input.interactPressed = false;
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

/** Non-blocking side card (ascent planets) — does not freeze movement. */
export function showAside(payload: PanelPayload | null): void {
  const card = document.getElementById("aside-card");
  if (!card) return;
  if (!payload) {
    const mediaEl = document.getElementById("aside-media");
    if (mediaEl) {
      mediaEl.innerHTML = "";
      mediaEl.classList.remove("has-video");
    }
    card.classList.add("hidden");
    return;
  }
  const title = document.getElementById("aside-title");
  const meta = document.getElementById("aside-meta");
  const body = document.getElementById("aside-body");
  const media = document.getElementById("aside-media");
  const links = document.getElementById("aside-links");
  if (title) title.textContent = payload.title;
  if (meta) {
    meta.textContent = payload.meta ?? "";
    meta.style.display = payload.meta ? "block" : "none";
  }
  if (body) {
    body.textContent = payload.body;
    // tags under body
    const oldTags = card.querySelector(".aside-tags");
    oldTags?.remove();
    if (payload.tags?.length) {
      const tags = document.createElement("div");
      tags.className = "tags aside-tags";
      for (const t of payload.tags) {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tags.appendChild(span);
      }
      body.insertAdjacentElement("afterend", tags);
    }
  }
  if (media) {
    media.innerHTML = "";
    const embeds: { id: string; start?: number; label?: string }[] = [];
    if (payload.youtubeId) {
      embeds.push({
        id: payload.youtubeId,
        start: payload.youtubeStart,
      });
    }
    for (const extra of payload.youtubeExtra ?? []) {
      embeds.push(extra);
    }
    if (embeds.length) {
      media.classList.add("has-video");
      embeds.forEach((emb, i) => {
        if (emb.label) {
          const lab = document.createElement("div");
          lab.className = "aside-video-label";
          lab.textContent = emb.label;
          media.appendChild(lab);
        }
        const wrap = document.createElement("div");
        wrap.className = "aside-video";
        const iframe = document.createElement("iframe");
        const start = emb.start != null ? `&start=${emb.start}` : "";
        // First embed autoplays with sound (user already interacted by walking).
        // Extra embeds stay paused so we don't stack audio.
        const autoplay = i === 0 ? 1 : 0;
        iframe.src =
          `https://www.youtube-nocookie.com/embed/${emb.id}` +
          `?autoplay=${autoplay}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1${start}`;
        iframe.title = emb.label ?? payload.title;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        // Don't lazy-load — that delays / blocks autoplay
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        wrap.appendChild(iframe);
        media.appendChild(wrap);
      });
    } else {
      media.classList.remove("has-video");
      if (payload.imageSrc) {
        const img = document.createElement("img");
        img.src = payload.imageSrc;
        img.alt = "";
        img.className = "aside-img";
        media.appendChild(img);
      }
    }
  }
  if (links) {
    links.innerHTML = "";
    for (const link of payload.links ?? []) {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = link.label;
      links.appendChild(a);
    }
  }
  card.classList.remove("hidden");
}

export function hideAside(): void {
  const media = document.getElementById("aside-media");
  if (media) {
    // tear down iframes so YouTube audio stops
    media.innerHTML = "";
    media.classList.remove("has-video");
  }
  showAside(null);
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
        else if (escapeToHome) escapeToHome();
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
  window.addEventListener("blur", () => clearMovementInput());

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
