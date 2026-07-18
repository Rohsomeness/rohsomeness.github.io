import type { CareerPlanet } from "./types";

/** order: 0 = lowest / earliest in the ascent sky */
export const careerPlanets: CareerPlanet[] = [
  {
    id: "ifmra-job",
    order: 0,
    name: "Carolina",
    role: "Research Intern",
    org: "University of South Carolina — EH&D Lab",
    dates: "2017",
    body: "Built clustering models for immunofluorescence microscopy (IFMRA). First real taste of postgraduate research — messy data, careful measurement, and science that has to work for someone else.",
    planetIndex: 0,
    links: [],
  },
  {
    id: "gt",
    order: 1,
    name: "Tech",
    role: "CS Student & ML TA",
    org: "Georgia Institute of Technology",
    dates: "Undergrad years",
    body: "Computer Science at Georgia Tech. Graduate TA for Machine Learning (CS 7641/4641). Robotics roots grew into AI, devices, and shipping real projects on the side.",
    planetIndex: 1,
    links: [{ label: "GitHub", url: "https://github.com/Rohsomeness" }],
  },
  {
    id: "builder",
    order: 2,
    name: "Builder",
    role: "Side Projects & Internships",
    org: "Open source & industry",
    dates: "2020 – 2022",
    body: "Apollo voice assistant, AutoNerf, multimodal ML (Hateful Memes), chat/weather apps, and more. Virtual Intern Anthem even took first place at John Deere's Got Talent — proof that code and music can share a season.",
    planetIndex: 2,
    links: [
      { label: "Projects on GitHub", url: "https://github.com/Rohsomeness" },
    ],
  },
  {
    id: "spacex",
    order: 3,
    name: "Orbit",
    role: "Software Engineer",
    org: "SpaceX",
    dates: "Present",
    body: "Building software that supports spacecraft and the people who fly them. This planet is the top of the climb — still learning, still shipping.\n\n(Exact title/dates welcome anytime — edit content/career.ts.)",
    planetIndex: 3,
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/roh-das/" },
    ],
  },
];
