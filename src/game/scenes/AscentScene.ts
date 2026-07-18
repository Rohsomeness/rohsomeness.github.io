import Phaser from "phaser";
import { careerPlanets } from "../../content/career";
import {
  consumeInteractPress,
  getInput,
  isUiBlocking,
  openPanel,
  setPrompt,
  setZoneLabel,
} from "../ui/dom";

const WORLD_W = 480;
const WORLD_H = 3200;
const SPEED = 180;

type PlanetSprite = {
  id: string;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  x: number;
  y: number;
  r: number;
};

export class AscentScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Image;
  private planets: PlanetSprite[] = [];
  private near: PlanetSprite | "exit" | null = null;

  constructor() {
    super("Ascent");
  }

  create(): void {
    setZoneLabel("Ascent · Career orbit");
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor("#02040c");
    this.cameras.main.fadeIn(400);

    // starfield
    const stars = this.add.graphics();
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * WORLD_W;
      const y = Math.random() * WORLD_H;
      const a = 0.25 + Math.random() * 0.75;
      stars.fillStyle(0xffffff, a);
      stars.fillCircle(x, y, Math.random() > 0.85 ? 1.5 : 0.9);
    }

    // ground / pad at bottom
    const g = this.add.graphics();
    g.fillStyle(0x1a2233, 1);
    g.fillRect(0, WORLD_H - 120, WORLD_W, 120);
    g.fillStyle(0x2a3142, 1);
    g.fillRoundedRect(WORLD_W / 2 - 70, WORLD_H - 100, 140, 50, 8);
    this.add
      .text(WORLD_W / 2, WORLD_H - 40, "↓ EXIT TO HUB", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ff9f43",
      })
      .setOrigin(0.5);

    this.add
      .text(WORLD_W / 2, 40, "Rise to explore jobs · each planet is a chapter", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // planets bottom → top
    const sorted = [...careerPlanets].sort((a, b) => a.order - b.order);
    const bottom = WORLD_H - 280;
    const top = 160;
    const span = bottom - top;

    sorted.forEach((p, i) => {
      const t = sorted.length === 1 ? 0 : i / (sorted.length - 1);
      const y = bottom - t * span;
      const x = WORLD_W / 2 + (i % 2 === 0 ? -90 : 90);
      const key = `planet_${p.planetIndex % 4}`;
      const sprite = this.add.image(x, y, key).setDisplaySize(72, 72).setDepth(5);
      // subtle pulse
      this.tweens.add({
        targets: sprite,
        scale: sprite.scale * 1.05,
        duration: 1400 + i * 200,
        yoyo: true,
        repeat: -1,
      });
      const label = this.add
        .text(x, y + 48, `${p.org ?? p.name}\n${p.role}`, {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#e8eefc",
          align: "center",
        })
        .setOrigin(0.5, 0)
        .setDepth(6);
      this.planets.push({ id: p.id, sprite, label, x, y, r: 56 });
    });

    // ship / player craft
    this.ship = this.physics.add.image(WORLD_W / 2, WORLD_H - 160, "ship");
    this.ship.setDisplaySize(64, 44);
    this.ship.setCollideWorldBounds(true);
    this.ship.setDepth(10);
    this.ship.setDamping(true);
    this.ship.setDrag(0.92);

    this.cameras.main.startFollow(this.ship, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.1);
  }

  update(): void {
    if (isUiBlocking()) {
      this.ship.setVelocity(0, 0);
      setPrompt(null);
      return;
    }

    const input = getInput();
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= SPEED;
    if (input.right) vx += SPEED;
    if (input.up) vy -= SPEED;
    if (input.down) vy += SPEED;
    this.ship.setVelocity(vx, vy);

    // slight bank
    this.ship.setAngle(Phaser.Math.Clamp(vx * 0.04, -12, 12));

    this.near = null;
    // exit zone
    if (this.ship.y > WORLD_H - 100) {
      this.near = "exit";
      setPrompt("Return to hub  ·  E / A");
      if (consumeInteractPress()) this.exitToHub();
      return;
    }

    for (const p of this.planets) {
      const d = Phaser.Math.Distance.Between(this.ship.x, this.ship.y, p.x, p.y);
      if (d < p.r) {
        this.near = p;
        const data = careerPlanets.find((c) => c.id === p.id);
        setPrompt(`${data?.role ?? "Job"}  ·  E / A`);
        if (consumeInteractPress()) this.openPlanet(p.id);
        return;
      }
    }
    setPrompt(null);
  }

  private openPlanet(id: string): void {
    const p = careerPlanets.find((c) => c.id === id);
    if (!p) return;
    openPanel({
      title: p.role,
      meta: [p.org, p.dates].filter(Boolean).join(" · "),
      body: p.body,
      links: p.links,
    });
  }

  private exitToHub(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("Hub");
    });
  }
}
