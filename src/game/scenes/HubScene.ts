import Phaser from "phaser";
import { PlayerController } from "../PlayerController";
import { paintHub, type DoorDef } from "../mapGen";
import {
  clearMovementInput,
  hideAside,
  isUiBlocking,
  setEscapeToHome,
  setPrompt,
  setZoneLabel,
} from "../ui/dom";
import { hasShades, refreshCoinHud, resetDwell, setDwellRing } from "../coins";

export class HubScene extends Phaser.Scene {
  private player!: PlayerController;
  private doors: DoorDef[] = [];
  private pad = { x: 0, y: 0, r: 48 };
  private transitioning = false;
  private boardGraceUntil = 0;
  private W = 960;
  private H = 640;

  constructor() {
    super("Hub");
  }

  create(): void {
    clearMovementInput();
    hideAside();
    setEscapeToHome(null); // already home
    setZoneLabel("Hub · Launch Campus");
    this.transitioning = false;

    this.W = this.scale.width;
    this.H = this.scale.height;

    this.physics.world.setBounds(0, 0, this.W, this.H);
    this.cameras.main.setBounds(0, 0, this.W, this.H);
    this.cameras.main.setBackgroundColor("#070b16");
    this.cameras.main.fadeIn(200);

    const map = paintHub(this, this.W, this.H);
    this.doors = map.doors;
    this.pad = map.pad;

    let spawn = map.spawn;
    const from = this.registry.get("returnFrom") as string | undefined;
    if (from === "ascent") {
      spawn = { x: this.pad.x, y: this.pad.y + this.pad.r + 55 };
      this.boardGraceUntil = this.time.now + 1200;
    } else if (from) {
      const door = this.doors.find((d) => d.target === from);
      if (door) spawn = { ...door.returnSpawn };
    }
    this.registry.remove("returnFrom");

    this.player = new PlayerController(this, spawn.x, spawn.y);
    if (hasShades()) this.player.setShades(true);
    this.physics.add.collider(this.player.sprite, map.walls);
    this.cameras.main.startFollow(this.player.sprite, true, 0.14, 0.14);
    refreshCoinHud();
    resetDwell();
    setDwellRing(false, 0);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.player?.destroy();
    });

    this.add
      .text(this.W / 2, this.H - 16, "Walk into a building · step on the pad to launch", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#9bb0d0",
        backgroundColor: "#070b16aa",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScrollFactor(0)
      .setAlpha(0.95);
  }

  update(_t: number, dt: number): void {
    if (this.transitioning) return;
    this.player.update(dt);
    if (isUiBlocking()) {
      setPrompt(null);
      return;
    }

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    const onPad =
      Phaser.Math.Distance.Between(px, py, this.pad.x, this.pad.y) < this.pad.r;
    if (onPad && this.time.now >= this.boardGraceUntil) {
      setPrompt(null);
      this.goAscent();
      return;
    }
    if (onPad) {
      setPrompt(null);
      return;
    }

    for (const d of this.doors) {
      if (
        px > d.rect.x &&
        px < d.rect.x + d.rect.w &&
        py > d.rect.y &&
        py < d.rect.y + d.rect.h
      ) {
        setPrompt(null);
        this.goRoom(d);
        return;
      }
    }

    setPrompt(null);
  }

  private goAscent(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.registry.set("returnFrom", "ascent");
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      clearMovementInput();
      this.scene.start("Ascent");
    });
  }

  private goRoom(d: DoorDef): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.registry.set("returnFrom", d.target);
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      clearMovementInput();
      this.scene.start("Room", { room: d.target });
    });
  }
}
