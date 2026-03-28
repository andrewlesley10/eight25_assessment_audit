import { extractedMetricsSchema } from "@/lib/schemas/extractedMetricsSchema";
import { sanitizeHtml } from "@/lib/scrape/sanitizeHtml";
import { extractCTAs } from "@/lib/extract/extractCTAs";
import { extractContent } from "@/lib/extract/extractContent";
import { extractHeadings } from "@/lib/extract/extractHeadings";
import { extractImages } from "@/lib/extract/extractImages";
import { extractLinks } from "@/lib/extract/extractLinks";
import { extractMetadata } from "@/lib/extract/extractMetadata";
import { AuditError } from "@/lib/utils/errors";
import type { ExtractedMetrics } from "@/types/audit";

export function extractMetrics(url: string, finalUrl: string, html: string): ExtractedMetrics {
  const $ = sanitizeHtml(html);
  const content = extractContent($);

  if (!content.bodyExcerpt) {
    throw new AuditError("The page did not contain enough visible content to analyze.", "EMPTY_CONTENT");
  }

  const headings = extractHeadings($);
  const ctas = extractCTAs($);
  const links = extractLinks($, finalUrl);
  const images = extractImages($);
  const metadata = extractMetadata($);

  const metrics = extractedMetricsSchema.parse({
    url,
    finalUrl,
    metaTitle: metadata.metaTitle,
    metaDescription: metadata.metaDescription,
    totalWordCount: content.totalWordCount,
    headings: headings.counts,
    ctas,
    links,
    images,
    contentPreview: {
      title: content.title,
      topHeadings: headings.topHeadings,
      firstParagraphs: content.firstParagraphs,
      bodyExcerpt: content.bodyExcerpt
    }
  });

  return metrics;
}
