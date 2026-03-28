import { CheerioAPI } from "cheerio";
import { isInternalUrl } from "@/lib/utils/url";

export function extractLinks($: CheerioAPI, finalUrl: string) {
  let internal = 0;
  let external = 0;

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) {
      return;
    }

    if (isInternalUrl(href, finalUrl)) {
      internal += 1;
    } else {
      external += 1;
    }
  });

  return {
    total: internal + external,
    internal,
    external
  };
}
