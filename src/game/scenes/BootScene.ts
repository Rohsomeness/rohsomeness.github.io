import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.rectangle(w / 2, h / 2, 200, 12, 0x1c2a48);
    const fill = this.add.rectangle(w / 2 - 98, h / 2, 4, 8, 0x5cc8ff).setOrigin(0, 0.5);
    this.add
      .text(w / 2, h / 2 - 28, "Loading…", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5);

    this.load.on("progress", (p: number) => {
      fill.width = 196 * p;
    });

    this.load.image("player_front", "/assets/player_front.png");
    this.load.image("player_side", "/assets/player_side.png");
    this.load.image("player_back", "/assets/player_back.png");
    this.load.image("ship", "/assets/ship.png");
    this.load.image("planet_0", "/assets/planet_0.png");
    this.load.image("planet_1", "/assets/planet_1.png");
    this.load.image("planet_2", "/assets/planet_2.png");
    this.load.image("planet_3", "/assets/planet_3.png");
  }

  create(): void {
    this.scene.start("Title");
  }
}
