import Phaser from "phaser";
import { about } from "../../content/about";
import { music } from "../../content/music";
import { projects } from "../../content/projects";
import type { PanelPayload } from "../../content/types";
import { paintRoom, type HotspotDef, type Rect } from "../mapGen";
import { PlayerController, type PropKey } from "../PlayerController";
import {
  clearMovementInput,
  hideAside,
  isUiBlocking,
  setEscapeToHome,
  setPrompt,
  setZoneLabel,
  showAside,
} from "../ui/dom";
import {
  flashCoinToast,
  hasCoin,
  resetDwell,
  setDwellRing,
  tickDwell,
} from "../coins";
import { playWinAnimation } from "../winAnim";

type RoomKey = "projects" | "music" | "story";

export class RoomScene extends Phaser.Scene {
  private player!: PlayerController;
  private hotspots: HotspotDef[] = [];
  private exit!: Rect;
  private room: RoomKey = "projects";
  private leaving = false;
  private activeId: string | null = null;
  private winPlaying = false;
  private W = 800;
  private H = 560;

  constructor() {
    super("Room");
  }

  init(data: { room?: string }): void {
    const r = data.room ?? "projects";
    this.room = (["projects", "music", "story"].includes(r) ? r : "projects") as RoomKey;
  }

  create(): void {
    clearMovementInput();
    hideAside();
    this.leaving = false;
    this.activeId = null;

    const titles: Record<RoomKey, string> = {
      projects: "Projects Lab",
      music: "Music Studio",
      story: "Story Library",
    };
    setZoneLabel(titles[this.room]);

    this.W = this.scale.width;
    this.H = this.scale.height;

    this.physics.world.setBounds(0, 0, this.W, this.H);
    this.cameras.main.setBounds(0, 0, this.W, this.H);
    this.cameras.main.setBackgroundColor("#0a0e18");
    this.cameras.main.fadeIn(220);

    const map = paintRoom(this, this.W, this.H, this.room);
    this.exit = map.exit;
    this.hotspots = this.buildHotspots(map.pathX);

    // Icons stay fixed size; glow circle reflects large hit radius
    for (const h of this.hotspots) {
      const icon = h.icon ?? "icon_pc";
      const glowR = Math.max(28, h.r * 0.62);
      this.add.circle(h.x, h.y + 4, glowR, 0x5cc8ff, 0.12).setDepth(3);
      if (this.textures.exists(icon)) {
        this.add.image(h.x, h.y, icon).setDisplaySize(36, 36).setDepth(4);
      }
    }

    const prop: PropKey =
      this.room === "music"
        ? "prop_violin"
        : this.room === "story"
          ? "prop_book"
          : "prop_macbook"; // Projects Lab — closed MacBook

    this.player = new PlayerController(this, map.spawn.x, map.spawn.y, prop);
    this.physics.add.collider(this.player.sprite, map.walls);
    this.cameras.main.startFollow(this.player.sprite, true, 0.14, 0.14);

    setEscapeToHome(() => this.goHub());
    // Mark already-collected spots with a small gold tint on icons
    this.refreshCollectedMarkers();
  }

  shutdown(): void {
    setEscapeToHome(null);
    resetDwell();
    setDwellRing(false, 0);
    this.player?.destroy();
  }

  private coinIdFor(h: HotspotDef): string {
    if (h.kind === "project") return `project:${h.contentId}`;
    if (h.kind === "music") return `music:${h.contentId}`;
    return `story:${h.contentId}`;
  }

  private refreshCollectedMarkers(): void {
    // optional visual: nothing heavy — toast + HUD cover it
  }

  private buildHotspots(pathX: number): HotspotDef[] {
    const list: HotspotDef[] = [];
    const top = 100;
    const bottom = this.H - 140;

    if (this.room === "projects") {
      const n = projects.length;
      projects.forEach((p, i) => {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const y = bottom - t * (bottom - top);
        const side = i % 2 === 0 ? -78 : 78;
        list.push({
          id: p.id,
          x: pathX + side,
          y,
          r: 96,
          label: p.title,
          kind: "project",
          contentId: p.id,
          icon: "icon_pc",
        });
      });
    } else if (this.room === "music") {
      const n = music.length;
      music.forEach((m, i) => {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const y = bottom - t * (bottom - top);
        const side = i % 2 === 0 ? -78 : 78;
        list.push({
          id: m.id,
          x: pathX + side,
          y,
          r: 100,
          label: m.title,
          kind: "music",
          contentId: m.id,
          icon: "icon_note",
        });
      });
    } else {
      list.push({
        id: "about",
        x: pathX - 78,
        y: this.H * 0.4,
        r: 96,
        label: "My Story",
        kind: "story",
        contentId: "about",
        icon: "icon_book",
      });
      list.push({
        id: "links",
        x: pathX + 78,
        y: this.H * 0.55,
        r: 96,
        label: "Links & Resume",
        kind: "story",
        contentId: "links",
        icon: "icon_link",
      });
    }
    return list;
  }

  update(_t: number, dt: number): void {
    if (this.leaving || this.winPlaying) return;
    this.player.update(dt);
    if (isUiBlocking()) {
      setPrompt(null);
      setDwellRing(false, 0);
      resetDwell();
      return;
    }

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    if (
      px > this.exit.x - 8 &&
      px < this.exit.x + this.exit.w + 8 &&
      py > this.exit.y - 12 &&
      py < this.exit.y + this.exit.h + 20
    ) {
      setPrompt(null);
      hideAside();
      setDwellRing(false, 0);
      resetDwell();
      this.goHub();
      return;
    }

    let nearest: HotspotDef | null = null;
    let best = Infinity;
    for (const h of this.hotspots) {
      const d = Phaser.Math.Distance.Between(px, py, h.x, h.y);
      if (d < h.r && d < best) {
        best = d;
        nearest = h;
      }
    }

    if (nearest) {
      const coinId = this.coinIdFor(nearest);
      if (hasCoin(coinId)) {
        setPrompt(null);
        setDwellRing(false, 0);
        resetDwell();
      } else {
        // No interact prompt — modal + dwell ring are enough
        setPrompt(null);
        const { progress, earnedId, completeWin } = tickDwell(coinId, dt);
        const cam = this.cameras.main;
        const sx = (nearest.x - cam.scrollX) * cam.zoom;
        const sy = (nearest.y - cam.scrollY) * cam.zoom;
        setDwellRing(progress > 0, progress, sx, sy);
        if (earnedId) {
          flashCoinToast(nearest.label);
          if (completeWin) {
            this.winPlaying = true;
            setDwellRing(false, 0);
            playWinAnimation(this, this.player, () => {
              this.winPlaying = false;
            });
          }
        }
      }
      if (this.activeId !== nearest.id) {
        this.activeId = nearest.id;
        const payload = this.payloadFor(nearest);
        if (payload) showAside(payload);
      }
    } else {
      if (this.activeId) {
        this.activeId = null;
        hideAside();
      }
      setPrompt(null);
      setDwellRing(false, 0);
      resetDwell();
    }
  }

  private payloadFor(h: HotspotDef): PanelPayload | null {
    if (h.kind === "project") {
      const p = projects.find((x) => x.id === h.contentId);
      if (!p) return null;
      return {
        title: p.title,
        meta: p.dates,
        body: p.summary,
        tags: p.tags,
        links: p.links,
        imageSrc: p.imageSrc ?? "/assets/icon_pc.png",
      };
    }
    if (h.kind === "music") {
      const m = music.find((x) => x.id === h.contentId);
      if (!m) return null;
      return {
        title: m.title,
        meta: m.dates,
        body: m.summary,
        links: m.links,
        imageSrc: m.youtubeId ? undefined : "/assets/icon_note.png",
        youtubeId: m.youtubeId,
        youtubeStart: m.youtubeStart,
        youtubeExtra: m.youtubeExtra,
      };
    }
    if (h.contentId === "about") {
      return {
        title: about.title,
        meta: about.blurb,
        body: about.body,
        links: about.links,
        imageSrc: "/assets/icon_book.png",
      };
    }
    if (h.contentId === "links") {
      return {
        title: "Find me",
        meta: "Links & resume",
        body: "Socials, code, and a resume download.",
        links: about.links,
        imageSrc: "/assets/icon_link.png",
      };
    }
    return null;
  }

  private goHub(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.registry.set("returnFrom", this.room);
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      clearMovementInput();
      this.scene.start("Hub");
    });
  }
}
