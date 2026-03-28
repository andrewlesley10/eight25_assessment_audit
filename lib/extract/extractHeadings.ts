import { CheerioAPI } from "cheerio";
import { normalizeWhitespace } from "@/lib/utils/text";

export function extractHeadings($: CheerioAPI) {
  const h1Text = $("h1")
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean);

  const h2Text = $("h2")
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean);

  const h3Text = $("h3")
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean);

  return {
    counts: {
      h1: h1Text.length,
      h2: h2Text.length,
      h3: h3Text.length
    },
    topHeadings: [...h1Text, ...h2Text, ...h3Text].slice(0, 8)
  };
}
