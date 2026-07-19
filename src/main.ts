import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { HubScene } from "./game/scenes/HubScene";
import { RoomScene } from "./game/scenes/RoomScene";
import { AscentScene } from "./game/scenes/AscentScene";
import { initDomUi } from "./game/ui/dom";
import { refreshCoinHud } from "./game/coins";

initDomUi();
refreshCoinHud();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#070b16",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    min: { width: 320, height: 480 },
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
    roundPixels: true,
  },
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
