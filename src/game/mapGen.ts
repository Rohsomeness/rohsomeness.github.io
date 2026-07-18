import Phaser from "phaser";

export type Rect = { x: number; y: number; w: number; h: number };

export type DoorDef = {
  id: string;
  label: string;
  rect: Rect;
  target: string;
  color: number;
};

export type HotspotDef = {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  kind: "project" | "music" | "story" | "ship" | "info";
  contentId?: string;
};

/** Simple procedural ground + walls as graphics + static bodies */
export function paintHub(scene: Phaser.Scene, width: number, height: number): {
  walls: Phaser.Physics.Arcade.StaticGroup;
  doors: DoorDef[];
  hotspots: HotspotDef[];
  spawn: { x: number; y: number };
} {
  const g = scene.add.graphics();
  // night pad
  g.fillStyle(0x0d1528, 1);
  g.fillRect(0, 0, width, height);

  // grass / pad rings
  g.fillStyle(0x1a2a1f, 1);
  g.fillRect(40, 40, width - 80, height - 80);

  // launch concrete
  g.fillStyle(0x2a3142, 1);
  g.fillRoundedRect(width / 2 - 90, 70, 180, 160, 8);
  g.lineStyle(2, 0x5cc8ff, 0.5);
  g.strokeRoundedRect(width / 2 - 90, 70, 180, 160, 8);
  g.lineStyle(2, 0xff9f43, 0.35);
  g.strokeCircle(width / 2, 150, 48);

  // path cross
  g.fillStyle(0x3a455c, 1);
  g.fillRect(width / 2 - 18, 220, 36, height - 280);
  g.fillRect(60, height / 2 - 18, width - 120, 36);

  // decorative stars
  g.fillStyle(0xffffff, 0.7);
  for (let i = 0; i < 40; i++) {
    const x = 20 + Math.random() * (width - 40);
    const y = 20 + Math.random() * (height - 40);
    g.fillCircle(x, y, Math.random() > 0.7 ? 1.5 : 1);
  }

  // zone pads
  const doors: DoorDef[] = [
    {
      id: "projects",
      label: "Projects Lab",
      rect: { x: width - 150, y: height / 2 - 50, w: 100, h: 100 },
      target: "projects",
      color: 0x3d7ea6,
    },
    {
      id: "music",
      label: "Music Studio",
      rect: { x: 50, y: height / 2 - 50, w: 100, h: 100 },
      target: "music",
      color: 0x8b5cf6,
    },
    {
      id: "story",
      label: "Story Corner",
      rect: { x: width / 2 - 50, y: height - 140, w: 100, h: 80 },
      target: "story",
      color: 0x2dd4a8,
    },
  ];

  for (const d of doors) {
    g.fillStyle(d.color, 0.85);
    g.fillRoundedRect(d.rect.x, d.rect.y, d.rect.w, d.rect.h, 10);
    g.lineStyle(2, 0xffffff, 0.35);
    g.strokeRoundedRect(d.rect.x, d.rect.y, d.rect.w, d.rect.h, 10);
    scene.add
      .text(d.rect.x + d.rect.w / 2, d.rect.y - 14, d.label, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#e8eefc",
      })
      .setOrigin(0.5)
      .setDepth(2);
  }

  scene.add
    .text(width / 2, 48, "LAUNCH PAD", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#5cc8ff",
    })
    .setOrigin(0.5)
    .setDepth(2);

  // ship sprite on pad
  if (scene.textures.exists("ship")) {
    scene.add
      .image(width / 2, 150, "ship")
      .setDisplaySize(100, 70)
      .setDepth(3);
  }

  const walls = scene.physics.add.staticGroup();
  // outer bounds as thin walls
  const edge = (x: number, y: number, w: number, h: number) => {
    const r = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
    scene.physics.add.existing(r, true);
    walls.add(r);
  };
  edge(0, 0, width, 24);
  edge(0, height - 24, width, 24);
  edge(0, 0, 24, height);
  edge(width - 24, 0, 24, height);

  const hotspots: HotspotDef[] = [
    {
      id: "board-ship",
      x: width / 2,
      y: 160,
      r: 48,
      label: "Board spacecraft",
      kind: "ship",
    },
  ];

  return {
    walls,
    doors,
    hotspots,
    spawn: { x: width / 2, y: height / 2 + 40 },
  };
}

export function paintRoom(
  scene: Phaser.Scene,
  width: number,
  height: number,
  theme: "projects" | "music" | "story",
): {
  walls: Phaser.Physics.Arcade.StaticGroup;
  hotspots: HotspotDef[];
  spawn: { x: number; y: number };
  exit: Rect;
} {
  const g = scene.add.graphics();
  const floors: Record<string, number> = {
    projects: 0x1a2338,
    music: 0x221833,
    story: 0x152820,
  };
  const accents: Record<string, number> = {
    projects: 0x3d7ea6,
    music: 0x8b5cf6,
    story: 0x2dd4a8,
  };

  g.fillStyle(floors[theme], 1);
  g.fillRect(0, 0, width, height);

  // floor tiles hint
  g.lineStyle(1, 0xffffff, 0.04);
  for (let x = 0; x < width; x += 32) g.lineBetween(x, 0, x, height);
  for (let y = 0; y < height; y += 32) g.lineBetween(0, y, width, y);

  // walls frame
  g.fillStyle(0x0a0e18, 1);
  g.fillRect(0, 0, width, 40);
  g.fillRect(0, height - 40, width, 40);
  g.fillRect(0, 0, 40, height);
  g.fillRect(width - 40, 0, 40, height);

  g.fillStyle(accents[theme], 0.9);
  g.fillRect(40, 40, width - 80, 8);

  const walls = scene.physics.add.staticGroup();
  const edge = (x: number, y: number, w: number, h: number) => {
    const r = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
    scene.physics.add.existing(r, true);
    walls.add(r);
  };
  edge(0, 0, width, 48);
  edge(0, height - 48, width, 48);
  edge(0, 0, 48, height);
  edge(width - 48, 0, 48, height);

  const exit: Rect = { x: width / 2 - 30, y: height - 70, w: 60, h: 30 };
  g.fillStyle(0xff9f43, 0.9);
  g.fillRoundedRect(exit.x, exit.y, exit.w, exit.h, 6);
  scene.add
    .text(width / 2, exit.y + 14, "EXIT", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#1a1005",
    })
    .setOrigin(0.5)
    .setDepth(2);

  const hotspots: HotspotDef[] = [];
  return {
    walls,
    hotspots,
    spawn: { x: width / 2, y: height - 100 },
    exit,
  };
}
