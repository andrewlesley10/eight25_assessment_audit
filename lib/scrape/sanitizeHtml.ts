import { load } from "cheerio";

export function sanitizeHtml(html: string) {
  const $ = load(html);
  $("script, style, noscript, svg, template").remove();
  return $;
}
