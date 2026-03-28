import { describe, expect, it } from "vitest";
import { extractCTAs } from "@/lib/extract/extractCTAs";
import { extractHeadings } from "@/lib/extract/extractHeadings";
import { extractImages } from "@/lib/extract/extractImages";
import { extractLinks } from "@/lib/extract/extractLinks";
import { extractMetadata } from "@/lib/extract/extractMetadata";
import { sanitizeHtml } from "@/lib/scrape/sanitizeHtml";

const html = `
<!doctype html>
<html>
  <head>
    <title>Premium Agency</title>
    <meta name="description" content="High-performing websites for premium brands." />
  </head>
  <body>
    <h1>Premium Agency</h1>
    <h2>Services</h2>
    <h3>SEO</h3>
    <a href="/work">Work</a>
    <a href="https://external.example.com">External</a>
    <a href="/contact" class="btn btn-primary">Get Started</a>
    <button>Book a Demo</button>
    <img src="/one.jpg" alt="Team photo" />
    <img src="/two.jpg" />
  </body>
</html>
`;

describe("extraction helpers", () => {
  const $ = sanitizeHtml(html);

  it("extracts heading counts", () => {
    expect(extractHeadings($).counts).toEqual({ h1: 1, h2: 1, h3: 1 });
  });

  it("classifies links as internal or external", () => {
    expect(extractLinks($, "https://agency.test")).toEqual({
      total: 3,
      internal: 2,
      external: 1
    });
  });

  it("calculates image alt coverage", () => {
    expect(extractImages($)).toEqual({
      total: 2,
      missingAlt: 1,
      missingAltPercent: 50,
      altSamples: ["Team photo"]
    });
  });

  it("detects CTA samples with simple heuristics", () => {
    expect(extractCTAs($)).toEqual({
      count: 2,
      samples: ["Book a Demo", "Get Started"]
    });
  });

  it("extracts metadata", () => {
    expect(extractMetadata($)).toEqual({
      metaTitle: "Premium Agency",
      metaDescription: "High-performing websites for premium brands."
    });
  });
});
