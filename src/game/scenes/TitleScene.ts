import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x070b16);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const s = this.add.circle(
        x,
        y,
        Math.random() > 0.8 ? 1.6 : 1,
        0xffffff,
        0.5 + Math.random() * 0.5,
      );
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: 800 + Math.random() * 1600,
        yoyo: true,
        repeat: -1,
      });
    }

    if (this.textures.exists("ship_up")) {
      this.add.image(width / 2, height * 0.36, "ship_up").setDisplaySize(48, 110);
    }

    this.add
      .text(width / 2, height * 0.55, "ROHIT DAS", {
        fontFamily: "monospace",
        fontSize: Math.min(40, width * 0.06) + "px",
        color: "#e8eefc",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.55 + 36, "Computer scientist · Musician · Explorer", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5);

    const cta = this.add
      .text(width / 2, height * 0.7, "Press any key / tap to start", {
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
      // No confirmation modal — go straight in
      this.scene.start("Hub");
    };

    this.input.keyboard?.once("keydown", start);
    this.input.once("pointerdown", start);
  }
}
