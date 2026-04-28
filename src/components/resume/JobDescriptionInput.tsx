"use client";

import { useState } from "react";
import { Loader2, Link } from "lucide-react";

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
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <h2 className="text-xs uppercase tracking-widest text-accent font-medium">Job Description</h2>
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground/60 mb-1.5">
          Paste a job posting URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
              placeholder="https://jobs.example.com/posting/123"
              className="w-full pl-9 pr-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            />
          </div>
          <button
            onClick={handleFetchUrl}
            disabled={isFetchingUrl || !urlInput.trim()}
            className="cursor-pointer px-4 py-2 bg-card hover:bg-border/30 text-foreground/70 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors border border-border/50"
          >
            {isFetchingUrl ? <Loader2 size={14} className="animate-spin" /> : "Fetch"}
          </button>
        </div>
        {urlError && <p className="mt-1.5 text-xs text-red-400">{urlError}</p>}
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground/60 mb-1.5">
          Or paste the job description directly
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste or type the job description here…"
          rows={7}
          className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/30 font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-y"
        />
        <p className="mt-1 text-xs text-foreground/30">{description.length} characters</p>
      </div>

      <button
        onClick={() => onGenerate(description)}
        disabled={isGenerating || !description.trim()}
        className="cursor-pointer w-full py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating Resume…
          </>
        ) : (
          "Generate Resume with AI"
        )}
      </button>
    </div>
  );
}
