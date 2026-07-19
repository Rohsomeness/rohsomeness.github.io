import Phaser from "phaser";
import { careerPlanets, launchPadInfo } from "../../content/career";
import type { CareerPlanet } from "../../content/types";
import {
  clearMovementInput,
  getInput,
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

const PLANET_GAP = 200;
const PLANET_H = 88;
const PAD_MARGIN = 190;
const TOP_PAD = 180;
const SPEED = 320;

type PlanetNode = {
  data: CareerPlanet;
  x: number;
  y: number;
  r: number;
  sprite: Phaser.GameObjects.Image;
};

export class AscentScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Image;
  private sideJetL!: Phaser.GameObjects.Image;
  private sideJetR!: Phaser.GameObjects.Image;
  private sideParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private planets: PlanetNode[] = [];
  private worldH = 1000;
  private worldW = 480;
  private activeId: string | null = null;
  private leaving = false;
  private exitGraceUntil = 0;
  private thrusting = false;
  private winPlaying = false;

  constructor() {
    super("Ascent");
  }

  create(): void {
    clearMovementInput();
    hideAside();
    this.leaving = false;
    this.activeId = null;
    this.thrusting = false;
    setZoneLabel("Ascent · Career orbit");
    setPrompt(null);

    const sorted = [...careerPlanets].sort((a, b) => a.order - b.order);
    this.worldW = Math.max(520, this.scale.width);

    // Extra vertical room so the top planet + rings never clip
    this.worldH =
      PAD_MARGIN +
      TOP_PAD +
      Math.max(0, sorted.length - 1) * PLANET_GAP +
      PLANET_H * 2 +
      80;

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    // Large camera padding so wide sprites (Saturn rings) stay fully visible
    const camPadX = Math.max(160, this.scale.width * 0.15);
    const camPadY = Math.max(140, this.scale.height * 0.12);
    this.cameras.main.setBounds(
      -camPadX,
      -camPadY,
      this.worldW + camPadX * 2,
      this.worldH + camPadY * 2,
    );
    this.cameras.main.setBackgroundColor("#02040c");
    this.cameras.main.fadeIn(350);

    const stars = this.add.graphics();
    for (let i = 0; i < 220; i++) {
      stars.fillStyle(0xffffff, 0.2 + Math.random() * 0.7);
      stars.fillCircle(
        -camPadX + Math.random() * (this.worldW + camPadX * 2),
        -camPadY + Math.random() * (this.worldH + camPadY * 2),
        Math.random() > 0.85 ? 1.5 : 0.9,
      );
    }

    const padY = this.worldH - 70;
    if (this.textures.exists("launch_pad")) {
      this.add
        .image(this.worldW / 2, padY + 10, "launch_pad")
        .setDisplaySize(200, 160)
        .setDepth(2);
    }

    this.add
      .text(this.worldW / 2, this.worldH - 18, "↓ Leave pad · return to hub", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ff9f43",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(this.worldW / 2, 28, "Liftoff · fly up past career planets", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // Mild zigzag — kept inset so wide sprites (rings / accretion disk) don't clip
    const firstPlanetY = this.worldH - PAD_MARGIN;
    const centerX = this.worldW / 2;
    const zig = Math.min(90, Math.max(48, this.worldW * 0.09));

    sorted.forEach((p, i) => {
      const y = firstPlanetY - i * PLANET_GAP;
      const x = centerX + (i % 2 === 0 ? -zig : zig);
      const key = this.resolvePlanetTexture(p.planetKey);
      const { w: natW, h: natH } = this.texturePixelSize(key);
      const dispH = PLANET_H;
      const dispW = Math.max(dispH, (natW / Math.max(1, natH)) * dispH);

      const sprite = this.add.image(x, y, key).setDisplaySize(dispW, dispH).setDepth(5);
      // Avoid alpha tween going so low it looks “broken”
      this.tweens.add({
        targets: sprite,
        alpha: { from: 1, to: 0.92 },
        duration: 1400 + i * 120,
        yoyo: true,
        repeat: -1,
      });
      // Company — role label under the planet (wrap long names)
      const label = p.name.length > 28 ? p.name.slice(0, 26) + "…" : p.name;
      this.add
        .text(x, y + dispH / 2 + 10, label, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#e8eefc",
          align: "center",
          backgroundColor: "#070b16aa",
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5, 0)
        .setDepth(6);
      this.planets.push({
        data: p,
        x,
        y,
        r: Math.max(dispW, dispH) * 0.55,
        sprite,
      });
    });

    // Idle ship (no thruster fire) on pad
    const idleKey = this.textures.exists("ship_up_idle") ? "ship_up_idle" : "ship_up";
    this.ship = this.physics.add.image(this.worldW / 2, padY - 36, idleKey);
    this.ship.setDisplaySize(34, 80);
    this.ship.setAngle(0);
    this.ship.setCollideWorldBounds(true);
    this.ship.setDepth(10);
    this.ship.setDrag(900);
    this.ship.setMaxVelocity(SPEED, SPEED);

    // Side RCS / gas jets — reaction control when strafing
    this.ensureSideThrustTexture();
    this.sideJetL = this.add
      .image(this.ship.x, this.ship.y, "side_thrust")
      .setDisplaySize(28, 14)
      .setDepth(9)
      .setVisible(false)
      .setAlpha(0.95);
    this.sideJetR = this.add
      .image(this.ship.x, this.ship.y, "side_thrust")
      .setDisplaySize(28, 14)
      .setDepth(9)
      .setVisible(false)
      .setAlpha(0.95);
    // Exhaust points outward from ship
    this.sideJetL.setFlipX(true); // left jet fires left when moving right

    // Soft particle gas when strafing
    if (this.textures.exists("side_thrust")) {
      this.sideParticles = this.add.particles(0, 0, "side_thrust", {
        lifespan: 240,
        speedX: { min: -20, max: 20 },
        speedY: { min: -25, max: 25 },
        scale: { start: 0.4, end: 0.05 },
        alpha: { start: 0.65, end: 0 },
        frequency: 35,
        quantity: 1,
        blendMode: "ADD",
        emitting: false,
      });
      this.sideParticles.setDepth(8);
    }

    this.cameras.main.startFollow(this.ship, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(
      Math.min(80, this.scale.width * 0.1),
      Math.min(100, this.scale.height * 0.12),
    );
    this.exitGraceUntil = this.time.now + 900;

    this.activeId = "launch-pad";
    showAside(launchPadInfo);
    setEscapeToHome(() => this.exitToHub());
  }

  shutdown(): void {
    setEscapeToHome(null);
    resetDwell();
    setDwellRing(false, 0);
  }

  update(_t: number, dt: number): void {
    if (this.leaving || this.winPlaying) return;

    if (isUiBlocking()) {
      this.ship.setVelocity(0, 0);
      setDwellRing(false, 0);
      resetDwell();
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

    this.ship.setAngle(Phaser.Math.Clamp(vx * 0.05, -14, 14));

    // Main thruster fire only when accelerating upward
    const shouldThrust = vy < -10;
    if (shouldThrust !== this.thrusting) {
      this.thrusting = shouldThrust;
      const key = shouldThrust
        ? this.textures.exists("ship_up")
          ? "ship_up"
          : "ship_up_idle"
        : this.textures.exists("ship_up_idle")
          ? "ship_up_idle"
          : "ship_up";
      if (this.ship.texture.key !== key && this.textures.exists(key)) {
        this.ship.setTexture(key);
        this.ship.setDisplaySize(34, 80);
      }
    }

    // Side gas jets when strafing (RCS) — not main engines
    this.updateSideJets(vx);

    // No mid-screen oval labels — info lives in the aside modal only
    setPrompt(null);

    if (this.ship.y > this.worldH - 50 && this.time.now >= this.exitGraceUntil) {
      this.exitToHub();
      return;
    }

    const onPad = this.ship.y > this.worldH - PAD_MARGIN + 30;
    if (onPad) {
      // Ensure idle look while parked
      if (this.thrusting === false && this.textures.exists("ship_up_idle")) {
        if (this.ship.texture.key !== "ship_up_idle") {
          this.ship.setTexture("ship_up_idle");
          this.ship.setDisplaySize(34, 80);
        }
      }
      if (this.activeId !== "launch-pad") {
        this.activeId = "launch-pad";
        showAside(launchPadInfo);
      }
      this.tickCoinSpot("career:launch-pad", "Launch pad", this.ship.x, this.ship.y, dt);
      return;
    }

    let best: PlanetNode | null = null;
    let bestDist = Infinity;
    for (const p of this.planets) {
      const dy = Math.abs(this.ship.y - p.y);
      const dx = Math.abs(this.ship.x - p.x);
      if (dy < 110 && dy + dx * 0.2 < bestDist) {
        bestDist = dy + dx * 0.2;
        best = p;
      }
    }

    if (best) {
      if (this.activeId !== best.data.id) {
        this.activeId = best.data.id;
        this.showPlanetCard(best.data);
      }
      this.tickCoinSpot(
        `career:${best.data.id}`,
        best.data.name,
        best.x,
        best.y,
        dt,
      );
    } else {
      setDwellRing(false, 0);
      resetDwell();
    }
  }

  private tickCoinSpot(
    coinId: string,
    label: string,
    worldX: number,
    worldY: number,
    dt: number,
  ): void {
    if (hasCoin(coinId)) {
      setDwellRing(false, 0);
      resetDwell();
      return;
    }
    const { progress, earnedId, completeWin } = tickDwell(coinId, dt);
    const cam = this.cameras.main;
    const sx = (worldX - cam.scrollX) * cam.zoom;
    const sy = (worldY - cam.scrollY) * cam.zoom;
    setDwellRing(progress > 0, progress, sx, sy);
    if (earnedId) {
      flashCoinToast(label);
      if (completeWin) {
        this.winPlaying = true;
        setDwellRing(false, 0);
        // No walking player on ascent — equip shades on next hub spawn via hasShades()
        playWinAnimation(this, null, () => {
          this.winPlaying = false;
        });
      }
    }
  }

  /** RCS gas jets: fire opposite the strafe direction. */
  private updateSideJets(vx: number): void {
    const midY = this.ship.y + 6;
    const offsetX = 22;
    const movingL = vx < -20;
    const movingR = vx > 20;

    // Moving right → jet on left side (pushes ship right)
    this.sideJetL.setPosition(this.ship.x - offsetX, midY);
    this.sideJetL.setVisible(movingR);
    this.sideJetL.setAngle(this.ship.angle);
    this.sideJetL.setFlipX(true);
    if (movingR) {
      this.sideJetL.setAlpha(0.75 + Math.random() * 0.25);
      this.sideJetL.setScale(
        0.9 + Math.random() * 0.3,
        0.8 + Math.random() * 0.25,
      );
    }

    // Moving left → jet on right side (pushes ship left)
    this.sideJetR.setPosition(this.ship.x + offsetX, midY);
    this.sideJetR.setVisible(movingL);
    this.sideJetR.setAngle(this.ship.angle);
    this.sideJetR.setFlipX(false);
    if (movingL) {
      this.sideJetR.setAlpha(0.75 + Math.random() * 0.25);
      this.sideJetR.setScale(
        0.9 + Math.random() * 0.3,
        0.8 + Math.random() * 0.25,
      );
    }

    if (this.sideParticles) {
      if (movingL || movingR) {
        const px = movingR ? this.ship.x - offsetX - 6 : this.ship.x + offsetX + 6;
        this.sideParticles.setPosition(px, midY);
        // Outward horizontal gas
        if (movingR) {
          this.sideParticles.speedX = { min: -110, max: -50 } as unknown as number;
        } else {
          this.sideParticles.speedX = { min: 50, max: 110 } as unknown as number;
        }
        this.sideParticles.speedY = { min: -35, max: 35 } as unknown as number;
        if (!this.sideParticles.emitting) this.sideParticles.start();
      } else if (this.sideParticles.emitting) {
        this.sideParticles.stop();
      }
    }
  }

  private ensureSideThrustTexture(): void {
    if (this.textures.exists("side_thrust") && this.textures.get("side_thrust").key !== "__MISSING") {
      return;
    }
    // Procedural cyan gas puff if asset missing
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5cc8ff, 0.9);
    g.fillEllipse(20, 12, 36, 14);
    g.fillStyle(0xffb347, 0.7);
    g.fillEllipse(12, 12, 14, 8);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(8, 12, 8, 5);
    g.generateTexture("side_thrust", 40, 24);
    g.destroy();
  }

  /** Prefer named planet; never use Phaser's green missing texture. */
  private resolvePlanetTexture(preferred: string): string {
    const ok = (k: string) =>
      this.textures.exists(k) && this.textures.get(k).key !== "__MISSING";
    if (ok(preferred)) return preferred;
    if (ok("planet_spacex")) return "planet_spacex";
    if (ok("planet_3")) return "planet_3";
    // Procedural fallback so we never show the green X
    const fb = `planet_fb_${preferred}`;
    if (!ok(fb)) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3d7ea6, 1);
      g.fillCircle(48, 48, 44);
      g.lineStyle(3, 0x9fd4ff, 0.8);
      g.strokeCircle(48, 48, 44);
      g.generateTexture(fb, 96, 96);
      g.destroy();
    }
    return fb;
  }

  private texturePixelSize(key: string): { w: number; h: number } {
    try {
      const tex = this.textures.get(key);
      if (!tex || tex.key === "__MISSING") return { w: 100, h: 100 };
      const frame = tex.get();
      const src = tex.getSourceImage() as { width?: number; height?: number } | null;
      const w = src?.width || frame.width || frame.cutWidth || 100;
      const h = src?.height || frame.height || frame.cutHeight || 100;
      return { w: w || 100, h: h || 100 };
    } catch {
      return { w: 100, h: 100 };
    }
  }

  private showPlanetCard(p: CareerPlanet): void {
    showAside({
      title: p.role,
      meta: [p.org, p.dates].filter(Boolean).join(" · "),
      body: p.body,
      links: p.links,
      imageSrc: `assets/${p.planetKey}.png`,
    });
  }

  private exitToHub(): void {
    if (this.leaving) return;
    this.leaving = true;
    hideAside();
    setPrompt(null);
    this.registry.set("returnFrom", "ascent");
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      clearMovementInput();
      this.scene.start("Hub");
    });
  }
}
