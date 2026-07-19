import type { MusicTrack } from "./types";

export const music: MusicTrack[] = [
  {
    id: "virtual-intern",
    title: "Virtual Intern Anthem",
    dates: "July 29, 2021",
    summary:
      "John Deere's Got Talent 2021 first-place song about the virtual intern experience during COVID — and a little window into how a song comes together. Singer: Rohit Das.",
    youtubeId: "EO9PpK4nZIY",
    youtubeStart: 204,
    links: [
      { label: "Open on YouTube", url: "https://youtu.be/EO9PpK4nZIY?t=204" },
    ],
  },
  {
    id: "raag-to-prelude",
    title: "From Raag to Prelude",
    dates: "October 14, 2020",
    summary:
      "Blending Indian and Western classical worlds. Sitar: Swati Das. Piano & violin: Rohit Das. Music is universal — this was the proof.",
    youtubeId: "RjXHfoB8Ieg",
    links: [
      {
        label: "Open on YouTube",
        url: "https://www.youtube.com/watch?v=RjXHfoB8Ieg",
      },
    ],
  },
  {
    id: "mj-tribute",
    title: "Michael Jackson Tribute",
    dates: "June 15, 2019",
    summary:
      "Senior farewell piano recital mashup of Billie Jean, Bad, and Smooth Criminal.",
    youtubeId: "fN1ojtmBCY0",
    youtubeStart: 50,
    links: [
      { label: "Open on YouTube", url: "https://youtu.be/fN1ojtmBCY0?t=50" },
    ],
  },
  {
    id: "lungi-dance",
    title: "Lungi Dance",
    dates: "October 23, 2018",
    summary:
      "Finale of the farewell concert for Purbasha Youth Band. Vocals: Rohit Das.",
    youtubeId: "dqfIalxvKuk",
    links: [
      {
        label: "Open on YouTube",
        url: "https://www.youtube.com/watch?v=dqfIalxvKuk",
      },
    ],
  },
  {
    id: "purbasha",
    title: "Purbasha Concert Solos",
    dates: "January 21, 2018",
    summary:
      "Solo vocals: All of Me (John Legend) and Ain't No Sunshine (Bill Withers).",
    youtubeId: "SVPNe9NmaBY",
    youtubeExtra: [
      { id: "bh9woQVqc3s", label: "Ain't No Sunshine" },
    ],
    links: [
      {
        label: "All of Me",
        url: "https://www.youtube.com/watch?v=SVPNe9NmaBY",
      },
      {
        label: "Ain't No Sunshine",
        url: "https://www.youtube.com/watch?v=bh9woQVqc3s",
      },
    ],
  },
];
