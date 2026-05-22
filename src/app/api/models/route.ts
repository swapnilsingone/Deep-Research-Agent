import { listModels } from "@/lib/openrouter";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const models = await listModels();
    return Response.json({ models });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load models";
    return Response.json({ error: message }, { status: 500 });
  }
}
