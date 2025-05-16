// filepath: c:\Users\domin\git\sopra-fs25-client\sopra-fs25-group-12-client\app\metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SoPra Group 12: Hearts Attack",
  description: "sopra-fs25-template-client",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/web-app-manifest-192x192.png", sizes: "192x192" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/site.webmanifest",
};
