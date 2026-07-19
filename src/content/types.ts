export type ContentLink = {
  label: string;
  url: string;
};

export type Project = {
  id: string;
  title: string;
  dates?: string;
  summary: string;
  tags?: string[];
  links?: ContentLink[];
  /** Image shown in the project aside card */
  imageSrc?: string;
};

export type MusicTrack = {
  id: string;
  title: string;
  dates?: string;
  summary: string;
  links?: ContentLink[];
  /** YouTube video id for embed */
  youtubeId?: string;
  /** Optional start time in seconds */
  youtubeStart?: number;
  /** Extra embeds (e.g. second performance) */
  youtubeExtra?: { id: string; start?: number; label?: string }[];
};

export type CareerPlanet = {
  id: string;
  order: number;
  name: string;
  role: string;
  org?: string;
  dates?: string;
  body: string;
  /** Texture key loaded in Boot (e.g. planet_deere) */
  planetKey: string;
  links?: ContentLink[];
};

export type AboutContent = {
  title: string;
  blurb: string;
  body: string;
  links?: ContentLink[];
};

export type PanelPayload = {
  title: string;
  meta?: string;
  body: string;
  tags?: string[];
  links?: ContentLink[];
  /** Optional image URL for aside / summary cards */
  imageSrc?: string;
  /** YouTube embed(s) */
  youtubeId?: string;
  youtubeStart?: number;
  youtubeExtra?: { id: string; start?: number; label?: string }[];
};

/** Parse common YouTube URL shapes → { id, start } */
export function parseYouTubeUrl(url: string): { id: string; start?: number } | null {
  try {
    const u = new URL(url);
    let id = "";
    let start: number | undefined;

    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
    } else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v") ?? "";
      if (!id && u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] ?? "";
      }
    }
    const t = u.searchParams.get("t") ?? u.searchParams.get("start");
    if (t) {
      // supports 204 or 1m30s
      if (/^\d+$/.test(t)) start = parseInt(t, 10);
      else {
        const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
        if (m) {
          start =
            (parseInt(m[1] || "0", 10) * 3600) +
            (parseInt(m[2] || "0", 10) * 60) +
            parseInt(m[3] || "0", 10);
        }
      }
    }
    // youtu.be/ID?t=204
    if (u.searchParams.has("t") && start === undefined) {
      const raw = u.searchParams.get("t")!;
      if (/^\d+$/.test(raw)) start = parseInt(raw, 10);
    }
    if (!id) return null;
    return start !== undefined ? { id, start } : { id };
  } catch {
    return null;
  }
}
