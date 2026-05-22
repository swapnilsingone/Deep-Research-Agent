"use client";

import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelPicker } from "@/components/model-picker";
import type { Depth, OutputStyle } from "@/lib/research/types";

export function SettingsPanel({
  depth,
  setDepth,
  outputStyle,
  setOutputStyle,
  model,
  setModel,
}: {
  depth: Depth;
  setDepth: (d: Depth) => void;
  outputStyle: OutputStyle;
  setOutputStyle: (s: OutputStyle) => void;
  model: string;
  setModel: (m: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
        }
      />
      <PopoverContent className="w-96 p-4 space-y-4" align="end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Research depth</label>
          <Select value={depth} onValueChange={(v) => setDepth(v as Depth)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-shot">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Single-shot</span>
                  <span className="text-xs text-muted-foreground font-normal">Fast — one search, one synthesis pass</span>
                </span>
              </SelectItem>
              <SelectItem value="multi-step">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Multi-step</span>
                  <span className="text-xs text-muted-foreground font-normal">Planner generates 3–5 sub-queries, parallel searches</span>
                </span>
              </SelectItem>
              <SelectItem value="iterative">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Iterative</span>
                  <span className="text-xs text-muted-foreground font-normal">Multi-step + reflection pass, up to 2 extra rounds</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Output style</label>
          <Select value={outputStyle} onValueChange={(v) => setOutputStyle(v as OutputStyle)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown-citations">Streamed markdown with citations</SelectItem>
              <SelectItem value="plain-sources">Plain answer + sources</SelectItem>
              <SelectItem value="chat">Chat-style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <ModelPicker value={model} onChange={setModel} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
