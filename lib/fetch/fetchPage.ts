import { AuditError } from "@/lib/utils/errors";
import { renderPage } from "@/lib/fetch/renderPage";

type FetchPageResult = {
  html: string;
  finalUrl: string;
};

function looksLikeInsufficientHtml(html: string): boolean {
  return html.length < 1_000 || (!html.includes("<h1") && !html.includes("<p"));
}

export async function fetchPage(url: string): Promise<FetchPageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.REQUEST_TIMEOUT_MS ?? 15_000));

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Website Audit Tool/1.0"
      },
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new AuditError(`Failed to fetch the page. Received HTTP ${response.status}.`, "FETCH_FAILED");
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new AuditError("The URL did not return HTML content.", "NON_HTML");
    }

    const html = await response.text();
    const finalUrl = response.url;

    if (looksLikeInsufficientHtml(html)) {
      const rendered = await renderPage(finalUrl);
      if (rendered?.html) {
        return rendered;
      }
    }

    return { html, finalUrl };
  } catch (error) {
    if (error instanceof AuditError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuditError("Page fetch timed out.", "FETCH_FAILED");
    }
    throw new AuditError("Unable to fetch the requested page.", "FETCH_FAILED");
  } finally {
    clearTimeout(timeout);
  }
}
