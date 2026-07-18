import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "autonerf",
    title: "AutoNerf",
    dates: "Aug 2021",
    summary:
      "Automatic smart-home-style Nerf system that detects, targets, and fires using computer vision and facial recognition — with friend lists so it won't blast pretrained faces. OpenCV on a Raspberry Pi 3B, Arduino Uno, servo/motor, laser-cut wood, and a Nerf Phoenix.",
    tags: ["OpenCV", "Raspberry Pi", "Arduino", "CV"],
    links: [
      { label: "Video", url: "https://youtu.be/9rLi6Xelfl4" },
      { label: "Code", url: "https://github.com/Rohsomeness/AutoNerf" },
    ],
  },
  {
    id: "hateful-memes",
    title: "Hateful Memes",
    dates: "May 2021",
    summary:
      "Deep multimodal classifier for hateful vs non-hateful memes. Combined image + caption signals with CLIP and beat prior baselines on the challenge setup.",
    tags: ["CLIP", "Multimodal", "ML"],
    links: [
      {
        label: "Paper",
        url: "https://www.overleaf.com/read/wjtybgmjkgbn",
      },
      { label: "Code", url: "https://github.com/Rohsomeness/Hateful-Memes" },
    ],
  },
  {
    id: "apollo",
    title: "Apollo Voice Assistant",
    dates: "May 2020 – Aug 2020",
    summary:
      "Customizable Windows voice assistant: reminders via text, brightness, news, weather, Wikipedia, app launch, search — plus Pokémon battle-mode easter eggs and on-screen bubble/mystify effects.",
    tags: ["Python", "Voice", "Desktop"],
    links: [
      {
        label: "Code",
        url: "https://github.com/Rohsomeness/Apollo-Voice-Assistant",
      },
    ],
  },
  {
    id: "chat-app",
    title: "Chat App",
    dates: "July 2020",
    summary:
      "Realtime chat with rooms, instant messaging, and a Send My Location feature. Node.js, Express, and MongoDB.",
    tags: ["Node.js", "Express", "MongoDB"],
    links: [
      { label: "Code", url: "https://github.com/Rohsomeness/node-weather-website" },
    ],
  },
  {
    id: "weather-app",
    title: "Weather App",
    dates: "June 2020",
    summary:
      "Address or city → geolocation + forecast. Node.js/Express backend wired to weather and geolocation APIs.",
    tags: ["Node.js", "APIs"],
    links: [
      { label: "Code", url: "https://github.com/Rohsomeness/node-weather-website" },
    ],
  },
  {
    id: "whats-cooking",
    title: "What's Cooking",
    dates: "Jan 2020 – May 2020",
    summary:
      "Cuisine classifier over complex recipe data — preprocessing-heavy ML with a side quest into how food trade shaped cultural overlap.",
    tags: ["ML", "NLP", "Classification"],
    links: [
      {
        label: "Colab",
        url: "https://colab.research.google.com/drive/1AMXeOdjOi7NDBqyMWyCURTpQ9jnpg724?usp=sharing",
      },
    ],
  },
  {
    id: "ifmra",
    title: "IFMRA",
    dates: "May 2017 – Aug 2017",
    summary:
      "Immunofluorescence Microscopy Result Analyzer — clustering models to help interpret lab microscopy results at the University of South Carolina Environmental Health and Disease Laboratory.",
    tags: ["Research", "Clustering"],
    links: [],
  },
];
