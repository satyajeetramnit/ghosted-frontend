"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, FileText, Loader2, CheckCircle, AlertCircle, ClipboardPaste,
} from "lucide-react";
import { ResumeData } from "@/types/resume";

interface Props {
  onExtracted: (resume: ResumeData) => void;
  onClose: () => void;
}

type Stage = "idle" | "extracting" | "done" | "error";

export default function ResumeUploadModal({ onExtracted, onClose }: Props) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(async (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setStage("extracting");
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "PDF parsing failed");
          setStage("error");
          return;
        }
        setText(data.text as string);
        setStage("idle");
      } catch {
        setError("Failed to parse PDF — please try again");
        setStage("error");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setText((e.target?.result as string) ?? "");
      reader.readAsText(file);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  async function handlePasteFromClipboard() {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText.trim()) setText(clipText);
    } catch {
      setError("Could not read clipboard. Paste manually into the text area.");
    }
  }

  async function handleExtract() {
    if (!text.trim()) return;
    setStage("extracting");
    setError("");

    try {
      const res = await fetch("/api/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Extraction failed");
        setStage("error");
        return;
      }

      setStage("done");
      setTimeout(() => {
        onExtracted(data.resume as ResumeData);
        onClose();
      }, 800);
    } catch {
      setError("Network error — please try again");
      setStage("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div>
            <h2 className="text-base font-semibold text-foreground">Import Existing Resume</h2>
            <p className="text-xs text-foreground/80 mt-0.5">
              AI will extract all details and pre-fill the resume builder
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-border/30 text-foreground/80 hover:text-foreground/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-accent/50 bg-accent/5"
                : "border-border/40 hover:border-accent/30 hover:bg-card/80"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={26} className="mx-auto text-foreground/70 mb-2" />
            <p className="text-sm font-medium text-foreground/70">
              Drop a <strong>.pdf</strong>, <strong>.txt</strong>, or <strong>.tex</strong> file here, or click to browse
            </p>
            <p className="text-xs text-foreground/70 mt-1">PDF text is extracted automatically before AI parsing</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.tex,.text"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-xs text-foreground/70">or</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>

          <button
            onClick={handlePasteFromClipboard}
            className="w-full flex items-center justify-center gap-2 py-2 border border-border/40 rounded-lg text-sm text-foreground/60 hover:bg-border/20 transition-colors"
          >
            <ClipboardPaste size={14} />
            Paste from Clipboard
          </button>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-foreground/60 flex items-center gap-1">
                <FileText size={12} /> Resume Text
              </label>
              <span className="text-xs text-foreground/70">{text.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume here — plain text, LaTeX, or HTML…"
              rows={10}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-xs font-mono text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-y"
            />
          </div>

          {stage === "error" && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {stage === "done" && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
              <CheckCircle size={15} />
              Extraction complete — loading your resume…
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border/50 text-foreground/60 text-sm font-medium rounded-lg hover:bg-border/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={!text.trim() || stage === "extracting" || stage === "done"}
            className="flex-1 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {stage === "extracting" ? (
              <><Loader2 size={14} className="animate-spin" /> Extracting with AI…</>
            ) : stage === "done" ? (
              <><CheckCircle size={14} /> Done</>
            ) : (
              <><Upload size={14} /> Extract with AI</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
