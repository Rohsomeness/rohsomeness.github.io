import type { CareerPlanet, PanelPayload } from "./types";

/**
 * One planet per experience (bottom → top after launch).
 * `name` is shown under the planet — use job-title-based labels.
 */

/** Launch pad — not a planet */
export const launchPadInfo: PanelPayload = {
  title: "High School & SAT",
  meta: "Launch pad · Where the countdown started",
  body: "Robotics in high school cracked open electronics, mechanics, and programming. Study nights, SAT grind, and the first systems that actually moved — every later orbit lifts off from here.",
  imageSrc: "/assets/launch_pad.png",
  links: [],
};

/** order: 0 = lowest; highest = SpaceX */
export const careerPlanets: CareerPlanet[] = [
  {
    id: "usc-research",
    order: 0,
    name: "USC — Research Intern",
    role: "Research Intern",
    org: "University of South Carolina — EH&D Lab",
    dates: "2017",
    body: "Immunofluorescence Microscopy Result Analyzer (IFMRA) — clustering models on lab microscopy data. First real research seat: messy measurements, careful validation, science that had to work for someone else.",
    planetKey: "planet_usc",
    links: [],
  },
  {
    id: "gt-cs",
    order: 1,
    name: "Georgia Tech — CS Student",
    role: "B.S. Computer Science",
    org: "Georgia Institute of Technology",
    dates: "Atlanta",
    body: "Computer Science at Georgia Tech — the long climb through systems, algorithms, and building things that scale. Home base for later teaching, research, and industry chapters.",
    planetKey: "planet_gt",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/roh-das/" },
    ],
  },
  {
    id: "john-deere",
    order: 2,
    name: "John Deere — SWE Intern",
    role: "Graphic Software Engineer Intern",
    org: "John Deere",
    dates: "May 2021 – Aug 2021",
    body: "Software engineering internship at John Deere. Also wrote and performed Virtual Intern Anthem — first place at John Deere's Got Talent 2021 — a COVID-era ode to remote intern life.",
    planetKey: "planet_deere",
    links: [
      { label: "Virtual Intern Anthem", url: "https://youtu.be/EO9PpK4nZIY?t=204" },
    ],
  },
  {
    id: "meta",
    order: 3,
    name: "Meta — ML Intern",
    role: "Graphic Machine Learning Intern",
    org: "Meta",
    dates: "May 2022 – Aug 2022 · Menlo Park, CA",
    body: "Machine learning internship at Meta — work on extractive and abstractive systems, analyzing and improving models in a production research setting.\n\n(Public LinkedIn: Meta Graphic Machine Learning Intern)",
    planetKey: "planet_meta",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/roh-das/" },
    ],
  },
  {
    id: "gt-ml-ta",
    order: 4,
    name: "Georgia Tech — ML TA",
    role: "ML TA · Applied NLP (Instructional Advisor)",
    org: "Georgia Institute of Technology",
    dates: "Teaching & advising",
    body: "Graduate TA for Machine Learning (CS 7641/4641). Still connected as Instructional Advisor teaching Applied NLP — language models, real systems, and students who ship.\n\n(LinkedIn: Instructional Advisor at GT · “Also teach Applied NLP at GT”)",
    planetKey: "planet_nlp",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/roh-das/" },
    ],
  },
  {
    id: "spacex",
    order: 5,
    name: "SpaceX — Software Engineer",
    role: "Software Engineer · ML for rockets",
    org: "SpaceX",
    dates: "Present · Los Angeles Metropolitan Area",
    body: "I work on ML for rockets at SpaceX — software and machine learning that supports the vehicles and the people who fly them. Based in the LA metro area.\n\n(Public LinkedIn: SpaceX · “I work on ML for rockets.”)",
    planetKey: "planet_spacex",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/roh-das/" },
    ],
  },
];
