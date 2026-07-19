import type Phaser from "phaser";
import type { PlayerController } from "./PlayerController";
import { markShadesUnlocked } from "./coins";

/**
 * Full-screen-ish celebration: flash, coin burst text, equip sunglasses on player.
 */
export function playWinAnimation(
  scene: Phaser.Scene,
  player: PlayerController | null,
  onDone?: () => void,
): void {
  markShadesUnlocked();

  const cam = scene.cameras.main;
  const cx = cam.scrollX + cam.width / 2;
  const cy = cam.scrollY + cam.height / 2;

  // Dim overlay
  const veil = scene.add
    .rectangle(cx, cy, cam.width * 2, cam.height * 2, 0x000000, 0)
    .setScrollFactor(0)
    .setDepth(200);
  scene.tweens.add({
    targets: veil,
    fillAlpha: 0.45,
    duration: 280,
  });

  const banner = scene.add
    .text(cam.width / 2, cam.height * 0.35, "ALL COINS!", {
      fontFamily: "monospace",
      fontSize: "28px",
      color: "#ffd54a",
      stroke: "#1a1005",
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201)
    .setAlpha(0)
    .setScale(0.5);

  const sub = scene.add
    .text(cam.width / 2, cam.height * 0.35 + 40, "Sunglasses unlocked", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#e8eefc",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201)
    .setAlpha(0);

  scene.tweens.add({
    targets: banner,
    alpha: 1,
    scale: 1.15,
    duration: 400,
    ease: "Back.easeOut",
    onComplete: () => {
      scene.tweens.add({
        targets: banner,
        scale: 1,
        duration: 200,
      });
    },
  });
  scene.tweens.add({
    targets: sub,
    alpha: 1,
    duration: 400,
    delay: 200,
  });

  // Sparkle coins
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const spark = scene.add
      .image(cam.width / 2, cam.height / 2, "ui_coin")
      .setScrollFactor(0)
      .setDepth(202)
      .setDisplaySize(20, 20)
      .setAlpha(0.9);
    scene.tweens.add({
      targets: spark,
      x: cam.width / 2 + Math.cos(ang) * (80 + Math.random() * 60),
      y: cam.height / 2 + Math.sin(ang) * (50 + Math.random() * 40),
      alpha: 0,
      scale: 0.3,
      duration: 700 + Math.random() * 300,
      delay: i * 40,
      onComplete: () => spark.destroy(),
    });
  }

  // Equip shades mid-celebration
  scene.time.delayedCall(500, () => {
    player?.setShades(true);
    // bounce player
    if (player) {
      scene.tweens.add({
        targets: player.sprite,
        scaleX: 1.9,
        scaleY: 1.9,
        duration: 180,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    }
  });

  // Camera flash
  cam.flash(400, 255, 220, 100);

  scene.time.delayedCall(2200, () => {
    scene.tweens.add({
      targets: [banner, sub, veil],
      alpha: 0,
      duration: 350,
      onComplete: () => {
        banner.destroy();
        sub.destroy();
        veil.destroy();
        onDone?.();
      },
    });
  });
}
