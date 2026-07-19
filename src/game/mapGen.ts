import Phaser from "phaser";

export type Rect = { x: number; y: number; w: number; h: number };

export type DoorDef = {
  id: string;
  label: string;
  rect: Rect;
  target: string;
  building: string;
  returnSpawn: { x: number; y: number };
};

export type HotspotDef = {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  kind: "project" | "music" | "story" | "ship" | "info";
  contentId?: string;
  icon?: string;
};

function addWall(
  scene: Phaser.Scene,
  walls: Phaser.Physics.Arcade.StaticGroup,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const r = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
  scene.physics.add.existing(r, true);
  walls.add(r);
}

export function paintHub(
  scene: Phaser.Scene,
  width: number,
  height: number,
): {
  walls: Phaser.Physics.Arcade.StaticGroup;
  doors: DoorDef[];
  spawn: { x: number; y: number };
  pad: { x: number; y: number; r: number };
} {
  const g = scene.add.graphics();

  // Night sky base
  g.fillStyle(0x070b18, 1);
  g.fillRect(0, 0, width, height);

  // Soft nebula washes
  g.fillStyle(0x1a1040, 0.35);
  g.fillCircle(width * 0.2, height * 0.15, Math.min(width, height) * 0.28);
  g.fillStyle(0x0a2040, 0.3);
  g.fillCircle(width * 0.85, height * 0.25, Math.min(width, height) * 0.32);
  g.fillStyle(0x102818, 0.25);
  g.fillCircle(width * 0.5, height * 0.9, Math.min(width, height) * 0.4);

  // Tiled ground texture if available
  if (scene.textures.exists("hub_ground")) {
    const tile = scene.add.tileSprite(width / 2, height / 2, width, height, "hub_ground");
    tile.setDepth(0);
    tile.setAlpha(0.85);
    tile.setTint(0xa8c4e0);
  } else {
    g.fillStyle(0x152218, 1);
    g.fillRect(24, 24, width - 48, height - 48);
  }

  // Vignette / border night frame
  g.lineStyle(3, 0x1e3a5f, 0.5);
  g.strokeRect(16, 16, width - 32, height - 32);

  // Stars (deterministic-ish scatter)
  g.fillStyle(0xffffff, 0.85);
  for (let i = 0; i < 70; i++) {
    const x = 24 + ((i * 97) % (width - 48));
    const y = 24 + ((i * 53) % (height - 48));
    const r = i % 5 === 0 ? 1.6 : 1;
    g.fillCircle(x, y, r);
  }
  // A few brighter stars
  for (let i = 0; i < 12; i++) {
    const x = 40 + ((i * 137) % (width - 80));
    const y = 40 + ((i * 89) % (height - 80));
    g.fillStyle(0x9fd4ff, 0.9);
    g.fillCircle(x, y, 1.8);
  }

  // Compact equidistant campus: center spawn, four destinations on a circle
  const cx = width / 2;
  const cy = height / 2;
  // Keep walk distances short and equal
  const ring = Math.min(width, height) * 0.26;
  const bSize = Math.min(100, Math.min(width, height) * 0.15);

  const padCx = cx;
  const padCy = cy - ring;
  const padR = Math.min(58, bSize * 0.55);

  // Paths from center to each destination
  const pathG = scene.add.graphics().setDepth(1);
  pathG.lineStyle(22, 0x2a3548, 0.9);
  const ends = [
    { x: padCx, y: padCy },
    { x: cx - ring, y: cy },
    { x: cx + ring, y: cy },
    { x: cx, y: cy + ring },
  ];
  for (const e of ends) {
    pathG.lineBetween(cx, cy, e.x, e.y);
  }
  // center plaza
  pathG.fillStyle(0x323f56, 0.95);
  pathG.fillCircle(cx, cy, 36);
  pathG.lineStyle(2, 0x5cc8ff, 0.35);
  pathG.strokeCircle(cx, cy, 36);

  // Launch pad
  if (scene.textures.exists("launch_pad")) {
    scene.add
      .image(padCx, padCy + 6, "launch_pad")
      .setDisplaySize(bSize * 1.35, bSize * 1.15)
      .setDepth(2);
  } else {
    g.fillStyle(0x2a3142, 1);
    g.fillRoundedRect(padCx - 70, padCy - 40, 140, 90, 10);
  }

  if (scene.textures.exists("ship_up")) {
    scene.add.image(padCx, padCy - 16, "ship_up").setDisplaySize(28, 64).setDepth(4);
  }

  scene.add
    .text(padCx, padCy - bSize * 0.62, "LAUNCH PAD", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#5cc8ff",
    })
    .setOrigin(0.5)
    .setDepth(5);

  const doors: DoorDef[] = [
    {
      id: "projects",
      label: "Projects Lab",
      rect: {
        x: cx + ring - bSize / 2,
        y: cy - bSize / 2,
        w: bSize,
        h: bSize,
      },
      target: "projects",
      building: "building_lab",
      returnSpawn: { x: cx + ring - bSize / 2 - 36, y: cy },
    },
    {
      id: "music",
      label: "Music Studio",
      rect: {
        x: cx - ring - bSize / 2,
        y: cy - bSize / 2,
        w: bSize,
        h: bSize,
      },
      target: "music",
      building: "building_studio",
      returnSpawn: { x: cx - ring + bSize / 2 + 36, y: cy },
    },
    {
      id: "story",
      label: "Story Library",
      rect: {
        x: cx - bSize / 2,
        y: cy + ring - bSize / 2,
        w: bSize,
        h: bSize,
      },
      target: "story",
      building: "building_library",
      returnSpawn: { x: cx, y: cy + ring - bSize / 2 - 36 },
    },
  ];

  for (const d of doors) {
    const bcx = d.rect.x + d.rect.w / 2;
    const bcy = d.rect.y + d.rect.h / 2;
    if (scene.textures.exists(d.building)) {
      scene.add
        .image(bcx, bcy - 4, d.building)
        .setDisplaySize(d.rect.w * 1.05, d.rect.h * 1.05)
        .setDepth(3);
    } else {
      g.fillStyle(0x3d5a80, 0.8);
      g.fillRoundedRect(d.rect.x, d.rect.y, d.rect.w, d.rect.h, 8);
    }
    scene.add
      .text(bcx, d.rect.y + d.rect.h + 2, d.label, {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#e8eefc",
      })
      .setOrigin(0.5, 0)
      .setDepth(4);
  }

  const walls = scene.physics.add.staticGroup();
  const t = 18;
  addWall(scene, walls, 0, 0, width, t);
  addWall(scene, walls, 0, height - t, width, t);
  addWall(scene, walls, 0, 0, t, height);
  addWall(scene, walls, width - t, 0, t, height);

  return {
    walls,
    doors,
    spawn: { x: cx, y: cy },
    pad: { x: padCx, y: padCy, r: padR },
  };
}

export function paintRoom(
  scene: Phaser.Scene,
  width: number,
  height: number,
  theme: "projects" | "music" | "story",
): {
  walls: Phaser.Physics.Arcade.StaticGroup;
  spawn: { x: number; y: number };
  exit: Rect;
  pathX: number;
} {
  const bgKey =
    theme === "projects" ? "room_lab" : theme === "music" ? "room_studio" : "room_library";

  if (scene.textures.exists(bgKey)) {
    const bg = scene.add.image(width / 2, height / 2, bgKey);
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setDepth(0).setAlpha(0.92);
  } else {
    const g = scene.add.graphics();
    const floors: Record<string, number> = {
      projects: 0x1a2338,
      music: 0x221833,
      story: 0x152820,
    };
    g.fillStyle(floors[theme], 1);
    g.fillRect(0, 0, width, height);
  }

  const veil = scene.add.graphics().setDepth(1);
  veil.fillStyle(0x070b16, 0.25);
  veil.fillRect(0, 0, width, 48);
  veil.fillRect(0, height - 70, width, 70);

  const pathX = width / 2;
  const path = scene.add.graphics().setDepth(1);
  path.fillStyle(0x000000, 0.12);
  path.fillRect(pathX - 42, 48, 84, height - 100);

  const titles: Record<string, string> = {
    projects: "PROJECTS LAB",
    music: "MUSIC STUDIO",
    story: "STORY LIBRARY",
  };
  scene.add
    .text(width / 2, 18, titles[theme], {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#e8eefc",
      backgroundColor: "#070b16aa",
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(6);

  const walls = scene.physics.add.staticGroup();
  addWall(scene, walls, 0, 0, width, 40);
  addWall(scene, walls, 0, 0, 36, height);
  addWall(scene, walls, width - 36, 0, 36, height);
  addWall(scene, walls, 0, height - 40, width / 2 - 52, 40);
  addWall(scene, walls, width / 2 + 52, height - 40, width / 2 - 52, 40);

  const exit: Rect = { x: width / 2 - 44, y: height - 58, w: 88, h: 52 };
  const eg = scene.add.graphics().setDepth(5);
  eg.fillStyle(0xff9f43, 0.95);
  eg.fillRoundedRect(exit.x, exit.y, exit.w, exit.h, 8);
  if (scene.textures.exists("icon_door")) {
    scene.add
      .image(width / 2 - 22, exit.y + 24, "icon_door")
      .setDisplaySize(26, 26)
      .setDepth(6);
  }
  scene.add
    .text(width / 2 + 12, exit.y + 24, "EXIT", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#1a1005",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(6);

  return {
    walls,
    spawn: { x: width / 2, y: height - 105 },
    exit,
    pathX,
  };
}
