export type Depth = "single-shot" | "multi-step" | "iterative";
export type OutputStyle = "markdown-citations" | "plain-sources" | "chat";

export interface Source {
  id: number;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export type ResearchEvent =
  | { type: "step"; label: string }
  | { type: "sources"; items: Source[] }
  | { type: "token"; delta: string }
  | { type: "error"; message: string }
  | { type: "done" };

export interface ResearchConfig {
  query: string;
  depth: Depth;
  model: string;
  outputStyle: OutputStyle;
}

export interface OrchestratorContext {
  config: ResearchConfig;
  emit: (event: ResearchEvent) => void;
}
