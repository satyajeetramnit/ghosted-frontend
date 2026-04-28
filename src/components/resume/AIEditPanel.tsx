"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onApply: (instruction: string) => void;
  isProcessing: boolean;
}

const SUGGESTIONS = [
  "Make the header font larger",
  "Add more spacing between sections",
  "Use compact margins to fit on one page",
  "Add color to the section headers",
  "Add an Objective section",
  "Remove the Professional Summary section",
];

export default function AIEditPanel({ onApply, isProcessing }: Props) {
  const [instruction, setInstruction] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  function handleApply(text?: string) {
    const cmd = text ?? instruction;
    if (!cmd.trim()) return;
    setHistory((prev) => [cmd, ...prev.slice(0, 4)]);
    onApply(cmd);
    if (!text) setInstruction("");
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <h2 className="text-xs uppercase tracking-widest text-accent font-medium">AI LaTeX Edit</h2>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Describe what to change in the LaTeX…"
          className="flex-1 px-3 py-2 text-sm bg-background border border-border/50 text-foreground placeholder:text-foreground/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
        />
        <button
          onClick={() => handleApply()}
          disabled={isProcessing || !instruction.trim()}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>

      <div className="border border-border/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowSuggestions((s) => !s)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground/50 bg-background/50 hover:bg-border/20 transition-colors tracking-wide"
        >
          Quick suggestions
          {showSuggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showSuggestions && (
          <div className="p-2 flex flex-col gap-1 bg-background/30">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleApply(s)}
                disabled={isProcessing}
                className="text-left text-xs px-2.5 py-1.5 rounded hover:bg-accent/10 hover:text-accent text-foreground/60 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-foreground/30 mb-1 tracking-wide">Recent edits</p>
          <div className="space-y-1">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleApply(h)}
                className="w-full text-left text-xs px-2.5 py-1.5 rounded bg-background/50 hover:bg-border/30 text-foreground/60 truncate transition-colors"
              >
                ↩ {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
