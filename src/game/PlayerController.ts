import Phaser from "phaser";
import { getInput, isUiBlocking } from "./ui/dom";

const SPEED = 140;

export class PlayerController {
  sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private facing: "front" | "back" | "side" = "front";
  private flipX = false;
  private bob = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "player_front");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.setScale(1.5);
    // footprint near feet (unscaled texture coords)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10);
    body.setOffset((this.sprite.width - 12) / 2, this.sprite.height - 12);
  }

  update(delta: number): void {
    if (isUiBlocking()) {
      this.sprite.setVelocity(0, 0);
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
      this.bob += delta * 0.02;
      this.sprite.setVelocity(vx, vy);
      this.sprite.y += Math.sin(this.bob) * 0.15;

      if (Math.abs(vy) > Math.abs(vx)) {
        this.facing = vy < 0 ? "back" : "front";
        this.flipX = false;
      } else {
        this.facing = "side";
        this.flipX = vx < 0;
      }
      this.applyTexture();
    } else {
      this.sprite.setVelocity(0, 0);
      this.applyTexture();
    }
  }

  private applyTexture(): void {
    const key =
      this.facing === "back"
        ? "player_back"
        : this.facing === "side"
          ? "player_side"
          : "player_front";
    if (this.sprite.texture.key !== key) this.sprite.setTexture(key);
    this.sprite.setFlipX(this.flipX);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
