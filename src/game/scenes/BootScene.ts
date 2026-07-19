import Phaser from "phaser";

const PLANET_KEYS = [
  "planet_usc",
  "planet_gt",
  "planet_deere",
  "planet_meta",
  "planet_nlp",
  "planet_spacex",
  "planet_spacex_alt",
  "planet_0",
  "planet_1",
  "planet_2",
  "planet_3",
] as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(w / 2, h / 2, w, h, 0x070b16);
    const fill = this.add
      .rectangle(w / 2 - 98, h / 2, 4, 8, 0x5cc8ff)
      .setOrigin(0, 0.5);
    this.add
      .text(w / 2, h / 2 - 28, "Loading…", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#9bb0d0",
      })
      .setOrigin(0.5);

    this.load.on("progress", (p: number) => {
      fill.width = Math.max(4, 196 * p);
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("[Boot] failed to load", file.key, file.url);
    });

    // Vite serves files from public/ at site root. Prefer absolute /assets/…
    // so loads work whether the page is / or /index.html.
    this.load.setPath("/assets/");

    const faces = ["front", "side", "back"] as const;
    for (const f of faces) {
      for (let i = 0; i < 4; i++) {
        this.load.image(`player_${f}_walk${i}`, `player_${f}_walk${i}.png`);
      }
      this.load.image(`player_${f}`, `player_${f}.png`);
    }
    this.load.image("ship", "ship.png");
    this.load.image("ship_up", "ship_up.png");
    this.load.image("ship_up_idle", "ship_up_idle.png");
    this.load.image("side_thrust", "side_thrust.png");
    this.load.image("prop_violin", "prop_violin.png");
    this.load.image("prop_book", "prop_book.png");
    this.load.image("prop_solder", "prop_solder.png");
    this.load.image("prop_macbook", "prop_macbook.png");
    this.load.image("prop_shades", "prop_shades.png");
    this.load.image("ui_coin", "ui_coin.png");
    this.load.image("launch_pad", "launch_pad.png");
    this.load.image("hub_ground", "hub_ground.png");
    this.load.image("building_lab", "building_lab.png");
    this.load.image("building_studio", "building_studio.png");
    this.load.image("building_library", "building_library.png");
    this.load.image("room_lab", "room_lab.png");
    this.load.image("room_studio", "room_studio.png");
    this.load.image("room_library", "room_library.png");

    for (const key of PLANET_KEYS) {
      this.load.image(key, `${key}.png`);
    }

    for (const icon of ["pc", "note", "book", "link", "door", "rocket"]) {
      this.load.image(`icon_${icon}`, `icon_${icon}.png`);
    }
  }

  create(): void {
    // Sanity: ensure planet textures registered
    for (const key of PLANET_KEYS) {
      if (!this.textures.exists(key)) {
        console.warn("[Boot] missing texture after load:", key);
      }
    }
    this.scene.start("Title");
  }
}
