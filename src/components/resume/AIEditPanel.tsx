"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp, Sparkles, Wand2, History, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onApply: (instruction: string) => void;
  isProcessing: boolean;
}

const SUGGESTIONS = [
  "Optimize for single-page density",
  "Enhance typography for readability",
  "Modernize section header aesthetics",
  "Balance white space for clean layout",
  "Inject a Strategic Objective section",
  "Refine Professional Summary syntax",
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
    <div className="bg-surface/50 rounded-[2rem] border border-border-muted p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
             <Wand2 className="w-4 h-4" />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Semantic Refinement</h2>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">
           <Zap className="w-3 h-3" />
           <span>Dynamic LaTeX Engine</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Instruct the AI to refine the artifact structure…"
            className="w-full pl-12 pr-4 py-3.5 text-sm bg-background border border-border-muted text-foreground placeholder:text-muted-foreground/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => handleApply()}
          disabled={isProcessing || !instruction.trim()}
          className="px-6 py-3.5 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>

      <div className="border border-border-muted rounded-xl overflow-hidden bg-background/50">
        <button
          onClick={() => setShowSuggestions((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-foreground transition-all"
        >
          Heuristic suggestions
          {showSuggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <AnimatePresence>
          {showSuggestions && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-background/10">
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleApply(s)}
                    disabled={isProcessing}
                    className="text-left text-[10px] font-bold px-4 py-2.5 rounded-lg hover:bg-foreground hover:text-background text-muted-foreground/90 transition-all disabled:opacity-50 border border-transparent hover:border-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2 px-1">
             <History className="w-3 h-3 text-muted-foreground/90" />
             <p className="text-[9px] font-black text-muted-foreground/70 uppercase tracking-[0.2em]">Iteration History</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleApply(h)}
                className="text-left text-[9px] font-bold px-3 py-1.5 rounded-full bg-surface border border-border-muted hover:border-foreground/20 text-muted-foreground/90 truncate transition-all max-w-[200px]"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
