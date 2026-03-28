import { AuditError } from "@/lib/utils/errors";

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AuditError("Please enter a URL.", "INVALID_URL");
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new AuditError("Please enter a valid website URL.", "INVALID_URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new AuditError("Only HTTP and HTTPS URLs are supported.", "INVALID_URL");
  }

  return url.toString();
}

export function isInternalUrl(href: string, baseUrl: string): boolean {
  try {
    const target = new URL(href, baseUrl);
    const origin = new URL(baseUrl);
    return target.origin === origin.origin;
  } catch {
    return false;
  }
}

export function safeDomainForFilename(url: string): string {
  return new URL(url).hostname.replace(/[^a-z0-9.-]/gi, "-");
}
