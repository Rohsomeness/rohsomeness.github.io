import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { HubScene } from "./game/scenes/HubScene";
import { RoomScene } from "./game/scenes/RoomScene";
import { AscentScene } from "./game/scenes/AscentScene";
import { initDomUi } from "./game/ui/dom";

initDomUi();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#070b16",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 640,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, HubScene, RoomScene, AscentScene],
  input: {
    keyboard: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
