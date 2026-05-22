import { NextRequest } from "next/server";
import { z } from "zod";
import { runResearch } from "@/lib/research";
import type { ResearchEvent } from "@/lib/research/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const BodySchema = z.object({
  query: z.string().min(1).max(2000),
  depth: z.enum(["single-shot", "multi-step", "iterative"]),
  model: z.string().min(1),
  outputStyle: z.enum(["markdown-citations", "plain-sources", "chat"]),
});

function sse(event: ResearchEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request body";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const emit = (event: ResearchEvent) => {
        controller.enqueue(encoder.encode(sse(event)));
      };
      try {
        await runResearch({ config: body, emit });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        emit({ type: "error", message });
        emit({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
