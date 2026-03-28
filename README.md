# Website Audit Tool

## Project Overview

This is a premium, single-page AI website audit tool built for the EIGHT25MEDIA-style assignment. It accepts one URL, extracts deterministic webpage metrics first, then sends a structured factual payload to Ollama for grounded analysis and recommendations. The product is intentionally focused, elegant, and inspectable.

## Why This Architecture

The project is implemented as a single Next.js 15 codebase with App Router so the UI, API route, extraction pipeline, and prompt logging live together. That keeps local setup simple while still preserving strong internal boundaries between:

- page fetching
- HTML sanitization
- metric extraction
- AI prompt construction
- Ollama analysis
- prompt log persistence

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide icons
- Cheerio
- Zod
- Ollama HTTP API
- Vitest
- Playwright fallback for rendered DOM when lightweight fetch is insufficient

## Pipeline

1. Validate the submitted URL.
2. Fetch HTML quickly.
3. Fall back to Playwright when HTML looks too thin.
4. Sanitize HTML and extract factual metrics.
5. Build a structured prompt from extracted metrics.
6. Send the structured payload to Ollama.
7. Validate strict JSON output with Zod.
8. Persist prompt traces to `prompt-logs/`.
9. Render the report with a strong separation between facts and AI.

## AI Design Decisions

- Ollama only, no OpenAI.
- AI never computes factual metrics directly.
- The AI prompt only sees extracted metrics plus carefully selected textual context.
- Output is forced into a strict JSON structure and validated before display.

## Prompt Design Strategy

The prompt system is split into:

- `lib/prompts/systemPrompt.ts`
- `lib/prompts/buildAuditPrompt.ts`

The system prompt sets grounding rules. The user prompt is assembled from:

- explicit schema instructions
- extracted metrics JSON
- content preview fields

## Factual Grounding

Facts are extracted before analysis and validated through Zod. The AI layer consumes:

- meta title and description
- heading counts
- CTA counts and samples
- internal and external links
- image alt coverage
- content preview and excerpt

Nothing in the factual metrics section is inferred by AI.

## Prompt Logging

Each audit writes a structured trace to `prompt-logs/` including:

- timestamp
- audited URL
- system prompt
- user prompt
- prompt construction notes
- structured input
- raw model output
- parsed output

The UI also exposes these traces through the trace panel.

## Folder Structure

```text
website-audit-tool/
  app/
    api/audit/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    audit/
    ui/
  lib/
    analyze/
    extract/
    fetch/
    logging/
    prompts/
    schemas/
    scrape/
    utils/
  prompt-logs/
  tests/
  types/
  Dockerfile
  docker-compose.yml
  package.json
  tailwind.config.ts
  vitest.config.ts
  .env.example
```

## Environment Variables

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_API_KEY=
NEXT_PUBLIC_APP_NAME=Website Audit Tool
REQUEST_TIMEOUT_MS=15000
OLLAMA_TIMEOUT_MS=90000
```

## Run Locally

```bash
cd website-audit-tool
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Ollama Setup

```bash
ollama pull qwen2.5:7b
ollama serve
```

If you want a lighter model:

```bash
ollama pull qwen3:4b
```

Then set `OLLAMA_MODEL=qwen3:4b`.

## Ollama Cloud

This app supports two Ollama Cloud patterns:

1. Local Ollama with cloud models

Use local Ollama as usual, sign in once, and point the app at your local Ollama server:

```bash
ollama signin
ollama pull gpt-oss:120b-cloud
ollama serve
```

Then use:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:120b-cloud
```

2. Direct ollama.com API access

For deployments such as Vercel, you can point the app straight at Ollama Cloud:

```env
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_API_KEY=your_api_key
```

The app will automatically send the bearer token when `OLLAMA_API_KEY` is present.

## Testing

```bash
npm run test
```

Current tests cover:

- heading extraction
- internal vs external link classification
- image alt computation
- CTA heuristics
- metadata extraction
- API route flow with mocked AI

## Run with Docker

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

## Example Output JSON

```json
{
  "success": true,
  "data": {
    "metrics": {
      "url": "https://example.com",
      "finalUrl": "https://example.com",
      "metaTitle": "Example Domain",
      "metaDescription": null,
      "totalWordCount": 32,
      "headings": { "h1": 1, "h2": 0, "h3": 0 },
      "ctas": { "count": 1, "samples": ["Learn more"] },
      "links": { "total": 1, "internal": 0, "external": 1 },
      "images": { "total": 0, "missingAlt": 0, "missingAltPercent": 0, "altSamples": [] },
      "contentPreview": {
        "title": "Example Domain",
        "topHeadings": ["Example Domain"],
        "firstParagraphs": ["This domain is for use in illustrative examples."],
        "bodyExcerpt": "Example Domain..."
      }
    },
    "insights": null,
    "trace": {},
    "warnings": []
  }
}
```

## Trade-Offs

- CTA detection is heuristic-based, not perfect semantic classification.
- Some JavaScript-heavy pages may still need Playwright fallback.
- Visible text extraction is approximate.
- AI insights depend on excerpt quality and prompt window selection.
- This is a single-page evaluator, not a full-site crawler.
- Prompt logs are intentionally verbose for transparency.

## Future Improvements

- multimodal screenshot analysis
- Lighthouse or PageSpeed integration
- stronger sectioning and main-content detection
- more advanced CTA classification
- richer SEO checks like title length and OG tags
- shareable report exports
- audit history and comparison views

## Screenshots

Add fresh screenshots after a local run to show:

- landing page
- loading state
- report view
- trace panel
