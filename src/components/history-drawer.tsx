"use client";

import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
  type HistoryEntry,
} from "@/lib/history";

function fmtTime(t: number): string {
  return new Date(t).toLocaleString();
}

export function HistoryDrawer({
  onPick,
}: {
  onPick: (entry: HistoryEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(loadHistory());
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        }
      />
      <SheetContent className="w-[420px] sm:max-w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Research history</SheetTitle>
          <SheetDescription>
            Past queries are saved locally in your browser.
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-end py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearHistory();
              setEntries([]);
            }}
            disabled={entries.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear all
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <ul className="space-y-2">
            {entries.length === 0 && (
              <li className="text-sm text-muted-foreground">No saved research yet.</li>
            )}
            {entries.map((e) => (
              <li key={e.id} className="rounded-md border p-3">
                <button
                  type="button"
                  className="text-left w-full"
                  onClick={() => {
                    onPick(e);
                    setOpen(false);
                  }}
                >
                  <div className="font-medium text-sm line-clamp-2">{e.query}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{e.depth}</Badge>
                    <span>{fmtTime(e.createdAt)}</span>
                  </div>
                </button>
                <div className="flex justify-end mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteHistoryEntry(e.id);
                      setEntries(loadHistory());
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
