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
};

export type MusicTrack = {
  id: string;
  title: string;
  dates?: string;
  summary: string;
  links?: ContentLink[];
};

export type CareerPlanet = {
  id: string;
  order: number;
  name: string;
  role: string;
  org?: string;
  dates?: string;
  body: string;
  planetIndex: number;
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
};
