import { CheerioAPI } from "cheerio";
import { normalizeWhitespace } from "@/lib/utils/text";

export function extractMetadata($: CheerioAPI) {
  const metaTitle = normalizeWhitespace($("title").first().text()) || null;
  const metaDescription =
    normalizeWhitespace($('meta[name="description"]').attr("content") ?? "") || null;

  return {
    metaTitle,
    metaDescription
  };
}
