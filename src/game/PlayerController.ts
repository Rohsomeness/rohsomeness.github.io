import Phaser from "phaser";
import { getInput, isUiBlocking } from "./ui/dom";
import { hasShades } from "./coins";

const SPEED = 260;
const FRAME_MS = 110;
const WALK_FRAMES = 4;

export type PropKey =
  | "prop_violin"
  | "prop_book"
  | "prop_solder"
  | "prop_macbook"
  | null;

export class PlayerController {
  sprite: Phaser.Physics.Arcade.Sprite;
  private prop: Phaser.GameObjects.Image | null = null;
  private shades: Phaser.GameObjects.Image | null = null;
  private propKey: PropKey = null;
  private facing: "front" | "back" | "side" = "front";
  private flipX = false;
  private frame = 0;
  private frameTimer = 0;
  private moving = false;
  private scene: Phaser.Scene;
  private readonly onPostUpdate: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, propKey: PropKey = null) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "player_front_walk0");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.setScale(1.6);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset((this.sprite.width - 12) / 2, this.sprite.height - 12);

    this.propKey = propKey;
    if (propKey && scene.textures.exists(propKey)) {
      this.prop = scene.add.image(x, y, propKey).setDepth(11);
    }

    if (hasShades()) {
      this.setShades(true);
    }

    // Sync accessories AFTER physics moves the sprite (fixes lag)
    this.onPostUpdate = () => this.layoutAccessories();
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);
    this.layoutAccessories();
  }

  setProp(propKey: PropKey): void {
    this.propKey = propKey;
    if (this.prop) {
      this.prop.destroy();
      this.prop = null;
    }
    if (propKey && this.scene.textures.exists(propKey)) {
      this.prop = this.scene.add
        .image(this.sprite.x, this.sprite.y, propKey)
        .setDepth(11);
    }
    this.layoutAccessories();
  }

  setShades(on: boolean): void {
    if (on) {
      if (!this.shades && this.scene.textures.exists("prop_shades")) {
        this.shades = this.scene.add
          .image(this.sprite.x, this.sprite.y, "prop_shades")
          .setDepth(12)
          .setOrigin(0.5, 0.5)
          .setDisplaySize(28, 12);
      }
      this.layoutAccessories();
    } else {
      this.shades?.destroy();
      this.shades = null;
    }
  }

  update(delta: number): void {
    if (isUiBlocking()) {
      this.sprite.setVelocity(0, 0);
      this.moving = false;
      this.applyTexture(true);
      return;
    }
    const input = getInput();
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * SPEED;
      vy = (vy / len) * SPEED;
      this.sprite.setVelocity(vx, vy);
      this.moving = true;

      if (Math.abs(vy) >= Math.abs(vx)) {
        this.facing = vy < 0 ? "back" : "front";
        this.flipX = false;
      } else {
        this.facing = "side";
        this.flipX = vx < 0;
      }

      this.frameTimer += delta;
      if (this.frameTimer >= FRAME_MS) {
        this.frameTimer = 0;
        this.frame = (this.frame + 1) % WALK_FRAMES;
      }
      // Only a tiny bob on side walks; front/back use gentle frames already
      const bounce = this.facing === "side" && this.frame % 2 === 1 ? -1 : 0;
      this.applyTexture(false, bounce);
    } else {
      this.sprite.setVelocity(0, 0);
      this.moving = false;
      this.frame = 0;
      this.frameTimer = 0;
      this.applyTexture(true, 0);
    }
  }

  private applyTexture(idle: boolean, bounce = 0): void {
    const base =
      this.facing === "back"
        ? "player_back"
        : this.facing === "side"
          ? "player_side"
          : "player_front";
    let key = idle || !this.moving ? `${base}_walk0` : `${base}_walk${this.frame}`;
    if (!this.sprite.scene.textures.exists(key)) {
      key = `${base}_walk0`;
    }
    if (this.sprite.texture.key !== key && this.sprite.scene.textures.exists(key)) {
      this.sprite.setTexture(key);
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(12, 10);
      body.setOffset((this.sprite.width - 12) / 2, this.sprite.height - 12);
    }
    this.sprite.setFlipX(this.flipX);
    this.sprite.setData("walkBob", bounce);
  }

  private layoutAccessories(): void {
    if (!this.sprite?.active) return;
    const s = this.sprite;
    const walkBob = (s.getData("walkBob") as number) || 0;
    // Minimal bob — front/back walks are already subtle
    const bob =
      this.facing === "side" && this.moving
        ? Math.sin(this.frame * 1.2) * 0.8 + walkBob
        : walkBob * 0.3;

    // Sunglasses: front view only, stuck to face after physics
    if (this.shades) {
      if (this.facing !== "front") {
        this.shades.setVisible(false);
      } else {
        this.shades.setVisible(true);
        const faceY = -25 + bob * 0.2;
        this.shades.setPosition(s.x, s.y + faceY);
        this.shades.setFlipX(false);
        this.shades.setDepth(12);
        this.shades.setAngle(0);
        this.shades.setDisplaySize(28, 12);
      }
    }

    if (!this.prop) return;

    let ox = 0;
    let oy = 0;
    let angle = 0;
    let flip = false;
    let depth = 11;
    let scale = 1;

    if (this.propKey === "prop_violin") {
      scale = 1.1;
      if (this.facing === "side") {
        ox = this.flipX ? -14 : 14;
        oy = 4 + bob;
        angle = this.flipX ? -25 : 25;
        flip = this.flipX;
      } else if (this.facing === "back") {
        ox = 10;
        oy = 2 + bob;
        angle = 15;
        depth = 9;
      } else {
        ox = -12;
        oy = 6 + bob;
        angle = -20;
      }
    } else if (this.propKey === "prop_book") {
      scale = 1.05;
      if (this.facing === "side") {
        ox = this.flipX ? -12 : 12;
        oy = 8 + bob;
        flip = this.flipX;
      } else if (this.facing === "back") {
        ox = 8;
        oy = 6 + bob;
        depth = 9;
      } else {
        ox = 10;
        oy = 10 + bob;
      }
    } else if (this.propKey === "prop_solder") {
      scale = 1.05;
      if (this.facing === "side") {
        ox = this.flipX ? -16 : 16;
        oy = 6 + bob;
        angle = this.flipX ? 40 : -40;
        flip = this.flipX;
      } else if (this.facing === "back") {
        ox = -10;
        oy = 4 + bob;
        angle = 30;
        depth = 9;
      } else {
        ox = 14;
        oy = 8 + bob;
        angle = -35;
      }
    } else if (this.propKey === "prop_macbook") {
      // Closed laptop — smaller, at the hip/side
      scale = 0.72;
      if (this.facing === "side") {
        ox = this.flipX ? -11 : 11;
        oy = 14 + bob;
        angle = this.flipX ? 6 : -6;
        flip = this.flipX;
      } else if (this.facing === "back") {
        ox = 10;
        oy = 12 + bob;
        angle = 4;
        depth = 9;
      } else {
        ox = 12;
        oy = 16 + bob;
        angle = -10;
      }
    }

    this.prop.setPosition(s.x + ox, s.y + oy);
    this.prop.setAngle(angle);
    this.prop.setFlipX(flip);
    this.prop.setDepth(depth);
    this.prop.setScale(scale);
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);
    this.prop?.destroy();
    this.prop = null;
    this.shades?.destroy();
    this.shades = null;
    if (this.sprite?.active) {
      this.sprite.destroy();
    }
  }
}
