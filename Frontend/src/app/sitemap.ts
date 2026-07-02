import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://resync.in", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://resync.in/apply", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
