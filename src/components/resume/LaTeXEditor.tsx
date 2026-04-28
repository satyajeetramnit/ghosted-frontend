"use client";

import dynamic from "next/dynamic";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-foreground/40 text-sm">
      Loading editor…
    </div>
  ),
});

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function LaTeXEditor({ value, onChange }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 flex flex-col" style={{ height: "600px" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/50 rounded-t-xl shrink-0">
        <h2 className="text-xs uppercase tracking-widest text-accent font-medium">LaTeX Source</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/30 font-mono">{value.split("\n").length} lines</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground/60 bg-card border border-border/50 rounded-md hover:bg-border/30 transition-colors"
          >
            {copied ? (
              <><Check size={11} className="text-green-400" /> Copied</>
            ) : (
              <><Copy size={11} /> Copy</>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="latex"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            fontSize: 13,
            fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
            minimap: { enabled: false },
            wordWrap: "on",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
