import Phaser from "phaser";
import { about } from "../../content/about";
import { music } from "../../content/music";
import { projects } from "../../content/projects";
import type { PanelPayload } from "../../content/types";
import { paintRoom, type HotspotDef, type Rect } from "../mapGen";
import { PlayerController } from "../PlayerController";
import {
  consumeInteractPress,
  isUiBlocking,
  openPanel,
  setPrompt,
  setZoneLabel,
} from "../ui/dom";

const W = 800;
const H = 560;

type RoomKey = "projects" | "music" | "story";

export class RoomScene extends Phaser.Scene {
  private player!: PlayerController;
  private hotspots: HotspotDef[] = [];
  private exit!: Rect;
  private room: RoomKey = "projects";
  private near: HotspotDef | "exit" | null = null;

  constructor() {
    super("Room");
  }

  init(data: { room?: string }): void {
    const r = data.room ?? "projects";
    this.room = (["projects", "music", "story"].includes(r) ? r : "projects") as RoomKey;
  }

  create(): void {
    const titles: Record<RoomKey, string> = {
      projects: "Projects Lab",
      music: "Music Studio",
      story: "Story Corner",
    };
    setZoneLabel(titles[this.room]);

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor("#0a0e18");
    this.cameras.main.fadeIn(250);

    const map = paintRoom(this, W, H, this.room);
    this.exit = map.exit;
    this.hotspots = this.buildHotspots();

    // draw terminals
    for (const h of this.hotspots) {
      const color =
        this.room === "projects" ? 0x3d7ea6 : this.room === "music" ? 0x8b5cf6 : 0x2dd4a8;
      this.add.rectangle(h.x, h.y, 36, 28, color, 0.95).setStrokeStyle(2, 0xffffff, 0.25);
      this.add
        .text(h.x, h.y - 26, h.label.slice(0, 18), {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#e8eefc",
        })
        .setOrigin(0.5);
    }

    this.player = new PlayerController(this, map.spawn.x, map.spawn.y);
    this.physics.add.collider(this.player.sprite, map.walls);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
  }

  private buildHotspots(): HotspotDef[] {
    const list: HotspotDef[] = [];
    if (this.room === "projects") {
      const cols = 3;
      projects.forEach((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        list.push({
          id: p.id,
          x: 140 + col * 200,
          y: 130 + row * 110,
          r: 40,
          label: p.title,
          kind: "project",
          contentId: p.id,
        });
      });
    } else if (this.room === "music") {
      music.forEach((m, i) => {
        list.push({
          id: m.id,
          x: 160 + (i % 3) * 200,
          y: 150 + Math.floor(i / 3) * 140,
          r: 42,
          label: m.title,
          kind: "music",
          contentId: m.id,
        });
      });
    } else {
      list.push({
        id: "about",
        x: W / 2,
        y: H / 2 - 20,
        r: 50,
        label: "My Story",
        kind: "story",
        contentId: "about",
      });
      // decorative second hotspot for resume
      list.push({
        id: "links",
        x: W / 2,
        y: H / 2 + 80,
        r: 40,
        label: "Links & Resume",
        kind: "story",
        contentId: "links",
      });
    }
    return list;
  }

  update(_t: number, dt: number): void {
    this.player.update(dt);
    if (isUiBlocking()) {
      setPrompt(null);
      return;
    }

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    this.near = null;

    if (
      px > this.exit.x &&
      px < this.exit.x + this.exit.w &&
      py > this.exit.y - 20 &&
      py < this.exit.y + this.exit.h + 10
    ) {
      this.near = "exit";
      setPrompt("Returning to hub…");
      this.goHub();
      return;
    }

    for (const h of this.hotspots) {
      if (Phaser.Math.Distance.Between(px, py, h.x, h.y) < h.r) {
        this.near = h;
        setPrompt(`${h.label}  ·  E / A`);
        if (consumeInteractPress()) this.openHotspot(h);
        return;
      }
    }
    setPrompt(null);
  }

  private openHotspot(h: HotspotDef): void {
    let payload: PanelPayload | null = null;
    if (h.kind === "project") {
      const p = projects.find((x) => x.id === h.contentId);
      if (!p) return;
      payload = {
        title: p.title,
        meta: p.dates,
        body: p.summary,
        tags: p.tags,
        links: p.links,
      };
    } else if (h.kind === "music") {
      const m = music.find((x) => x.id === h.contentId);
      if (!m) return;
      payload = {
        title: m.title,
        meta: m.dates,
        body: m.summary,
        links: m.links,
      };
    } else if (h.contentId === "about") {
      payload = {
        title: about.title,
        meta: about.blurb,
        body: about.body,
        links: about.links,
      };
    } else if (h.contentId === "links") {
      payload = {
        title: "Find me",
        meta: "Links",
        body: "Socials, code, and a resume download.",
        links: about.links,
      };
    }
    if (payload) openPanel(payload);
  }

  private leaving = false;

  private goHub(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Hub");
    });
  }
}
