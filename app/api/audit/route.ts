import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAuditAnalysis } from "@/lib/analyze/runAuditAnalysis";
import { extractMetrics } from "@/lib/extract/extractMetrics";
import { fetchPage } from "@/lib/fetch/fetchPage";
import { writePromptLog } from "@/lib/logging/writePromptLog";
import { AuditError } from "@/lib/utils/errors";
import { normalizeUrl } from "@/lib/utils/url";

const inputSchema = z.object({
  url: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = inputSchema.parse(await request.json());
    const normalizedUrl = normalizeUrl(body.url);
    const { html, finalUrl } = await fetchPage(normalizedUrl);
    const metrics = extractMetrics(normalizedUrl, finalUrl, html);

    const warnings: string[] = [];
    let insights = null;
    let trace = null;

    try {
      const analysis = await runAuditAnalysis(metrics);
      insights = analysis.insights;
      trace = analysis.trace;

      try {
        await writePromptLog(trace);
      } catch {
        warnings.push("Prompt log persistence was skipped in this environment, but the in-app trace is still available.");
      }
    } catch (error) {
      if (error instanceof AuditError) {
        warnings.push(error.message);
        trace = {
          timestamp: new Date().toISOString(),
          url: metrics.finalUrl,
          systemPrompt: "",
          userPrompt: "",
          promptConstruction: {
            builder: "buildAuditPrompt(metrics)",
            sections: []
          },
          structuredInput: metrics,
          rawModelOutput: "",
          parsedOutput: null
        };
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        insights,
        trace,
        warnings
      }
    });
  } catch (error) {
    if (error instanceof AuditError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Please provide a valid URL."
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "Unexpected server error."
        }
      },
      { status: 500 }
    );
  }
}
