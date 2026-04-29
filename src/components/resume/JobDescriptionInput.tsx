"use client";

import { useState } from "react";
import { Loader2, Link as LinkIcon, Sparkles, Database, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onGenerate: (description: string) => void;
  isGenerating: boolean;
}

export default function JobDescriptionInput({ onGenerate, isGenerating }: Props) {
  const [description, setDescription] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  async function handleFetchUrl() {
    if (!urlInput.trim()) return;
    setUrlError("");
    setIsFetchingUrl(true);
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.error ?? "Failed to fetch URL");
      } else {
        setDescription(data.content);
      }
    } catch {
      setUrlError("Network error while fetching URL");
    } finally {
      setIsFetchingUrl(false);
    }
  }

  return (
    <div className="bg-surface/30 rounded-[2.5rem] border border-border-muted p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-background border border-border-muted flex items-center justify-center text-foreground">
             <Database className="w-4 h-4" />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Target Intelligence</h2>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground/40 italic">Provide job specifications for semantic alignment.</p>
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-2">Posting URL</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
              placeholder="https://jobs.example.com/posting/123"
              className="w-full pl-12 pr-5 py-4 bg-background border border-border-muted rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
            />
          </div>
          <button
            onClick={handleFetchUrl}
            disabled={isFetchingUrl || !urlInput.trim()}
            className="px-6 py-4 bg-surface border border-border-muted rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-background hover:border-border transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Ingest</span>
          </button>
        </div>
        <AnimatePresence>
          {urlError && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-2">
              Error: {urlError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Textarea */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-2">Raw Specification</label>
        <div className="relative group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste job description text here for manual processing…"
            rows={8}
            className="w-full px-6 py-6 bg-background border border-border-muted rounded-[2rem] text-sm text-foreground/80 placeholder:text-muted-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all resize-none font-medium leading-relaxed"
          />
          <div className="absolute bottom-4 right-6 text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">
            {description.length} Characters
          </div>
        </div>
      </div>

      <button
        onClick={() => onGenerate(description)}
        disabled={isGenerating || !description.trim()}
        className="w-full py-5 bg-foreground text-background rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Synthesizing Artifact…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Artifact with AI</span>
          </>
        )}
      </button>
    </div>
  );
}
