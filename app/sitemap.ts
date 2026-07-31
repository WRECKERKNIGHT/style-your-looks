import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nexari.app";

  const staticPages = [
    { url: baseUrl, priority: 1, frequency: "monthly" as const },
    { url: `${baseUrl}/login`, priority: 0.5, frequency: "monthly" as const },
    { url: `${baseUrl}/signup`, priority: 0.5, frequency: "monthly" as const },
    { url: `${baseUrl}/dashboard`, priority: 0.8, frequency: "weekly" as const },
    { url: `${baseUrl}/face-analysis`, priority: 0.9, frequency: "weekly" as const },
    { url: `${baseUrl}/body-analysis`, priority: 0.9, frequency: "weekly" as const },
    { url: `${baseUrl}/color-analysis`, priority: 0.9, frequency: "weekly" as const },
    { url: `${baseUrl}/grooming`, priority: 0.8, frequency: "weekly" as const },
    { url: `${baseUrl}/virtual-tryon`, priority: 0.7, frequency: "weekly" as const },
    { url: `${baseUrl}/style-dna`, priority: 0.7, frequency: "weekly" as const },
    { url: `${baseUrl}/recommendations`, priority: 0.8, frequency: "weekly" as const },
    { url: `${baseUrl}/community`, priority: 0.6, frequency: "daily" as const },
    { url: `${baseUrl}/skin-health`, priority: 0.7, frequency: "weekly" as const },
    { url: `${baseUrl}/style-quiz`, priority: 0.6, frequency: "monthly" as const },
    { url: `${baseUrl}/history`, priority: 0.5, frequency: "monthly" as const },
    { url: `${baseUrl}/profile`, priority: 0.5, frequency: "monthly" as const },
  ];

  return staticPages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.frequency,
    priority: page.priority,
  }));
}
