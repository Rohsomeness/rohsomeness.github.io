import Phaser from "phaser";
import { openHelp } from "../ui/dom";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x070b16);

    // stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const s = this.add.circle(x, y, Math.random() > 0.8 ? 1.6 : 1, 0xffffff, 0.5 + Math.random() * 0.5);
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: 800 + Math.random() * 1600,
        yoyo: true,
        repeat: -1,
      });
    }

    if (this.textures.exists("ship")) {
      this.add.image(width / 2, height * 0.38, "ship").setDisplaySize(160, 110);
    }

    this.add
      .text(width / 2, height * 0.58, "ROHIT DAS", {
        fontFamily: "monospace",
        fontSize: "36px",
        color: "#e8eefc",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.58 + 36, "Computer scientist · Musician · Explorer", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5);

    const cta = this.add
      .text(width / 2, height * 0.72, "Press any key / tap to start", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#5cc8ff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: cta,
      alpha: 0.25,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const start = () => {
      this.input.keyboard?.off("keydown", start);
      this.input.off("pointerdown", start);
      openHelp();
      this.scene.start("Hub");
    };

    this.input.keyboard?.once("keydown", start);
    this.input.once("pointerdown", start);
  }
}
