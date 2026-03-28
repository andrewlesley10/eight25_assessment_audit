import { CheerioAPI } from "cheerio";
import { looksLikeCta, normalizeWhitespace } from "@/lib/utils/text";

export function extractCTAs($: CheerioAPI) {
  const samples = new Set<string>();

  $("button").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (text) {
      samples.add(text);
    }
  });

  $("a[href]").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    const classHint = $(element).attr("class");
    if (text && looksLikeCta(text, classHint)) {
      samples.add(text);
    }
  });

  return {
    count: samples.size,
    samples: [...samples].slice(0, 8)
  };
}
