export async function renderPage(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: "Website Audit Tool/1.0" });
    await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
    const html = await page.content();
    const finalUrl = page.url();
    await browser.close();
    return { html, finalUrl };
  } catch {
    return null;
  }
}
