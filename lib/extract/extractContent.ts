import { CheerioAPI } from "cheerio";
import { countWords, normalizeWhitespace, truncate } from "@/lib/utils/text";

export function extractContent($: CheerioAPI) {
  const title = normalizeWhitespace($("title").first().text()) || null;

  const firstParagraphs = $("p")
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean)
    .slice(0, 3);

  const bodyText = normalizeWhitespace($("body").text());

  return {
    title,
    firstParagraphs,
    bodyExcerpt: truncate(bodyText, 1_400),
    totalWordCount: countWords(bodyText)
  };
}
