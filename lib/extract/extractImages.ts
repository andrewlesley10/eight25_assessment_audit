import { CheerioAPI } from "cheerio";
import { normalizeWhitespace } from "@/lib/utils/text";

export function extractImages($: CheerioAPI) {
  const images = $("img");
  let missingAlt = 0;
  const altSamples: string[] = [];

  images.each((_, element) => {
    const alt = $(element).attr("alt");
    if (!alt || !alt.trim()) {
      missingAlt += 1;
      return;
    }

    if (altSamples.length < 5) {
      altSamples.push(normalizeWhitespace(alt));
    }
  });

  return {
    total: images.length,
    missingAlt,
    missingAltPercent: images.length === 0 ? 0 : Number(((missingAlt / images.length) * 100).toFixed(2)),
    altSamples
  };
}
