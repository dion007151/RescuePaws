import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RescuePaws – Stray Animal Rescue Map",
    short_name: "RescuePaws",
    description:
      "Report and rescue stray animals in your community. Real-time map, GPS tracking, and rescue missions — all free.",
    start_url: "/map",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fcfbf7",
    theme_color: "#f8947b",
    categories: ["lifestyle", "social", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Open Map",
        url: "/map",
        description: "View the live rescue map",
      },
      {
        name: "My Impact",
        url: "/impact",
        description: "See your rescue missions",
      },
    ],
  };
}
