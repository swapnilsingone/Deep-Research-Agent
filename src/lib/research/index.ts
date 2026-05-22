import type { OrchestratorContext } from "./types";
import { runSingleShot } from "./single-shot";
import { runMultiStep } from "./multi-step";
import { runIterative } from "./iterative";

export async function runResearch(ctx: OrchestratorContext) {
  switch (ctx.config.depth) {
    case "single-shot":
      return runSingleShot(ctx);
    case "multi-step":
      return runMultiStep(ctx);
    case "iterative":
      return runIterative(ctx);
  }
}
