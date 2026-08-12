import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl();

  const staticPages = [
    { url: baseUrl, priority: 1, frequency: "monthly" as const },
    { url: `${baseUrl}/about`, priority: 0.6, frequency: "monthly" as const },
    { url: `${baseUrl}/privacy`, priority: 0.4, frequency: "monthly" as const },
    { url: `${baseUrl}/terms`, priority: 0.4, frequency: "monthly" as const },
    { url: `${baseUrl}/login`, priority: 0.5, frequency: "monthly" as const },
    { url: `${baseUrl}/signup`, priority: 0.5, frequency: "monthly" as const },
  ];

  return staticPages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.frequency,
    priority: page.priority,
  }));
}
