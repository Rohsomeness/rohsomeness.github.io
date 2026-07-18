import Phaser from "phaser";
import { PlayerController } from "../PlayerController";
import { paintHub, type DoorDef, type HotspotDef } from "../mapGen";
import {
  consumeInteractPress,
  isUiBlocking,
  setPrompt,
  setZoneLabel,
} from "../ui/dom";

const W = 960;
const H = 640;

export class HubScene extends Phaser.Scene {
  private player!: PlayerController;
  private doors: DoorDef[] = [];
  private hotspots: HotspotDef[] = [];
  private near: { type: "door" | "hot"; id: string; label: string } | null = null;

  constructor() {
    super("Hub");
  }

  create(): void {
    setZoneLabel("Hub · Launch Campus");
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor("#070b16");

    const map = paintHub(this, W, H);
    this.doors = map.doors;
    this.hotspots = map.hotspots;

    const spawn = (this.registry.get("hubSpawn") as { x: number; y: number } | undefined) ?? map.spawn;
    this.player = new PlayerController(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player.sprite, map.walls);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    this.add
      .text(W / 2, H - 28, "Walk into a zone · Board the ship for career planets", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0.85);
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

    for (const h of this.hotspots) {
      if (Phaser.Math.Distance.Between(px, py, h.x, h.y) < h.r) {
        this.near = { type: "hot", id: h.id, label: h.label };
        break;
      }
    }

    if (!this.near) {
      for (const d of this.doors) {
        if (
          px > d.rect.x &&
          px < d.rect.x + d.rect.w &&
          py > d.rect.y &&
          py < d.rect.y + d.rect.h
        ) {
          this.near = { type: "door", id: d.target, label: `Enter ${d.label}` };
          break;
        }
      }
    }

    if (this.near) {
      // Doors: walk in to enter. Ship: require interact.
      if (this.near.type === "door") {
        setPrompt(`${this.near.label}…`);
        this.activate(this.near);
      } else {
        setPrompt(`${this.near.label}  ·  E / A`);
        if (consumeInteractPress()) this.activate(this.near);
      }
    } else {
      setPrompt(null);
    }
  }

  private transitioning = false;

  private activate(target: { type: "door" | "hot"; id: string }): void {
    if (this.transitioning || isUiBlocking()) return;
    this.transitioning = true;
    if (target.type === "hot" && target.id === "board-ship") {
      this.registry.set("hubSpawn", {
        x: this.player.sprite.x,
        y: this.player.sprite.y + 40,
      });
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Ascent");
      });
      return;
    }
    if (target.type === "door") {
      this.registry.set("hubSpawn", {
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      });
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Room", { room: target.id });
      });
    }
  }
}
