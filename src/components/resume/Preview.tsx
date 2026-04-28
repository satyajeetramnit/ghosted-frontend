"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  readonly latex: string;
}

/**
 * Extract one brace-balanced argument starting at `pos` (skips leading whitespace).
 * Returns { content (without outer braces), end (index after closing '}') } or null.
 */
function extractBracedArg(str: string, pos: number): { content: string; end: number } | null {
  let i = pos;
  while (i < str.length && (str[i] === " " || str[i] === "\t" || str[i] === "\r" || str[i] === "\n")) i++;
  if (i >= str.length || str[i] !== "{") return null;
  let depth = 1;
  i++;
  let content = "";
  while (i < str.length) {
    const ch = str[i];
    if (ch === "{") { depth++; content += ch; }
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { content, end: i + 1 };
      content += ch;
    } else {
      content += ch;
    }
    i++;
  }
  return null; // unbalanced
}

/**
 * Process all occurrences of `cmd` that take `argCount` brace-delimited arguments,
 * using balanced-brace extraction so nested `{...}` inside args are handled correctly.
 */
function processCmd(
  html: string,
  cmd: string,
  argCount: number,
  render: (...args: string[]) => string
): string {
  let out = "";
  let i = 0;
  while (i < html.length) {
    const idx = html.indexOf(cmd, i);
    if (idx === -1) { out += html.slice(i); break; }
    // Ensure it is a command boundary — a letter immediately after means partial match
    const afterChar = html[idx + cmd.length] ?? "";
    if ((afterChar >= "A" && afterChar <= "Z") || (afterChar >= "a" && afterChar <= "z")) {
      out += html.slice(i, idx + cmd.length);
      i = idx + cmd.length;
      continue;
    }
    out += html.slice(i, idx);
    let pos = idx + cmd.length;
    const args: string[] = [];
    let failed = false;
    for (let n = 0; n < argCount; n++) {
      const arg = extractBracedArg(html, pos);
      if (!arg) { failed = true; break; }
      args.push(arg.content);
      pos = arg.end;
    }
    if (failed) { out += cmd; i = idx + cmd.length; continue; }
    out += render(...args);
    i = pos;
  }
  return out;
}

/** Strip one level of outer braces if present: {University} → University */
function stripOuterBraces(s: string): string {
  return /^\{[\s\S]*\}$/.test(s) ? s.slice(1, -1) : s;
}

function latexToHtml(latex: string): string {
  let h = latex;

  // Extract \begin{document}...\end{document} body
  const bodyMatch = /\\begin\{document\}([\s\S]*?)\\end\{document\}/.exec(h);
  if (bodyMatch) h = bodyMatch[1];

  // Remove comments
  h = h.replaceAll(/%[^\n]*/g, "");

  // --- KaTeX: extract math BEFORE HTML-escaping so KaTeX gets raw LaTeX ---
  const mathSlots: string[] = [];
  // Display math $$...$$
  h = h.replaceAll(/\$\$([^$]+)\$\$/g, (_, math: string) => {
    const idx = mathSlots.length;
    try {
      mathSlots.push(katex.renderToString(math.trim(), { throwOnError: false, displayMode: true }));
    } catch {
      mathSlots.push(math);
    }
    return `%%MATH_${idx}%%`;
  });
  // Inline math $...$  (skip already-escaped \$)
  h = h.replaceAll(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, math: string) => {
    const idx = mathSlots.length;
    try {
      mathSlots.push(katex.renderToString(math.trim(), { throwOnError: false, displayMode: false }));
    } catch {
      mathSlots.push(math);
    }
    return `%%MATH_${idx}%%`;
  });
  // -----------------------------------------------------------------

  // HTML-escape raw < > &
  h = h
    .replaceAll(/&(?!amp;|lt;|gt;|#)/g, "&amp;")
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  // Unescape LaTeX-escaped special chars
  h = h
    .replaceAll(String.raw`\&amp;`, '&amp;')
    .replaceAll(String.raw`\_`, '_')
    .replaceAll(String.raw`\%`, '%')
    .replaceAll(String.raw`\$`, '$')
    .replaceAll(String.raw`\#`, '#')
    .replaceAll(String.raw`\textbackslash{}`, '');

  // Section headers
  h = h.replaceAll(/\\section\{([^}]+)\}/g, '<h2 class="preview-section">$1</h2>');

  // \href must come BEFORE \resumeSubheading so nested hrefs in subheading args have no braces
  h = h.replaceAll(
    /\\href\{([^}]+)\}\{([^}]+)\}/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="preview-link">$2</a>'
  );

  // Resume name — handle {\LARGE \textbf{Name}} and \LARGE \textbf{Name}
  h = h.replaceAll(/\{\\LARGE\s*\\textbf\{([^}]+)\}\}/g, '<h1 class="preview-name">$1</h1>');
  h = h.replaceAll(/\\LARGE\s*\\textbf\{([^}]+)\}/g, '<h1 class="preview-name">$1</h1>');

  // Inline formatting (convert before \resumeSubheading so content inside args is clean)
  h = h.replaceAll(/\\textbf\{([^}]+)\}/g, "<strong>$1</strong>");
  h = h.replaceAll(/\\textit\{([^}]+)\}/g, "<em>$1</em>");
  h = h.replaceAll(/\\underline\{([^}]+)\}/g, "<u>$1</u>");
  h = h.replaceAll(/\\textcolor\{[^}]+\}\{([^}]+)\}/g, '<span style="color:#2563eb">$1</span>');
  h = h.replaceAll(/\\color\{[^}]+\}/g, "");

  // \begin{center}...\end{center}
  h = h.replaceAll(
    /\\begin\{center\}([\s\S]*?)\\end\{center\}/g,
    '<div class="preview-center">$1</div>'
  );

  // \resumeSubheading{a}{b}{c}{d} — balanced-brace extraction handles nested content
  h = processCmd(h, String.raw`\resumeSubheading`, 4, (a, b, c, d) =>
    '<div class="subheading">' +
    `<div class="preview-row"><strong>${stripOuterBraces(a)}</strong>` +
    `<span class="preview-right">${stripOuterBraces(b)}</span></div>` +
    `<div class="preview-row"><em class="small">${c}</em>` +
    `<span class="preview-right small">${d}</span></div>` +
    "</div>"
  );

  // \resumeItem{label}{content}
  h = processCmd(h, String.raw`\resumeItem`, 2, (_label, content) => `<li>${content}</li>`);

  // Resume list environments
  h = h.replaceAll(String.raw`\resumeItemListStart`, '<ul class="preview-list">');
  h = h.replaceAll(String.raw`\resumeItemListEnd`, '</ul>');
  h = h.replaceAll(String.raw`\resumeSubHeadingListStart`, '<div class="subheading-list">');
  h = h.replaceAll(String.raw`\resumeSubHeadingListEnd`, '</div>');

  // Generic itemize for the skills section — optional [...] arg on \begin{itemize}
  h = h.replaceAll(/\\begin\{itemize\}(\[[^\]]*\])?/g, '<ul class="skills-list">');
  h = h.replaceAll(String.raw`\end{itemize}`, '</ul>');
  h = h.replaceAll(/\\item(?![a-zA-Z])\s*/g, "<li>");

  // \textbar{} separator (outside math mode)
  h = h.replaceAll(String.raw`\textbar{}`, ' | ');

  // Line breaks
  h = h.replaceAll(/\\\\\s*\[[\d.]+cm\]/g, "<br/>");
  h = h.replaceAll('\\\\', '<br/>');

  // Spacing commands
  h = h.replaceAll(/\\vspace\{[^}]+\}/g, "");
  h = h.replaceAll(/\\hspace\{[^}]+\}/g, " ");

  // \small{...} — strip command wrapper, keep inner content (balanced extraction)
  h = processCmd(h, String.raw`\small`, 1, (content) => content);

  // Remove any remaining LaTeX commands with optional [] and/or {} args
  h = h.replaceAll(/\\[a-zA-Z@]+(\[[^\]]*\])?(\{[^}]*\})*/g, "");

  // Strip orphan braces left from LaTeX grouping
  h = h.replaceAll(/[{}]/g, "");

  // Paragraph breaks and inline newlines
  h = h.replaceAll(/\n{2,}/g, "</p><p>");
  h = h.replaceAll('\n', ' ');

  // Restore KaTeX-rendered math
  h = h.replaceAll(/%%MATH_(\d+)%%/g, (_, idx: string) => mathSlots[Number(idx)] ?? '');

  return `<div class="preview-body"><p>${h}</p></div>`;
}

export default function Preview({ latex }: Props) {
  const html = useMemo(() => latexToHtml(latex), [latex]);

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col" style={{ minHeight: "600px" }}>
      <div className="px-4 py-3 border-b border-border/40 bg-background/50 rounded-t-xl shrink-0">
        <h2 className="text-xs uppercase tracking-widest text-accent font-medium">Resume Preview</h2>
        <p className="text-xs text-foreground/40 mt-0.5">Rendered with KaTeX — structural layout is approximate</p>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div
          className="preview-container"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <style>{`
        .preview-container {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          color: #1a1a1a;
          max-width: 780px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .preview-center { text-align: center; margin-bottom: 8px; }
        .preview-name {
          font-size: 1.8rem; font-weight: 800; text-align: center;
          margin: 0 0 4px 0; display: block;
        }
        .preview-section {
          font-size: 1rem; font-weight: 700;
          border-bottom: 1.5px solid #374151;
          margin-top: 16px; margin-bottom: 6px;
          padding-bottom: 2px;
          text-transform: uppercase; letter-spacing: 0.06em; color: #1e1e1e;
        }
        .preview-body p { margin: 4px 0; }
        .preview-list { list-style-type: disc; padding-left: 18px; margin: 3px 0; }
        .preview-list li { margin: 1px 0; font-size: 10.5pt; }
        .skills-list { list-style: none; padding-left: 0; margin: 4px 0; }
        .skills-list li { margin: 2px 0; font-size: 10.5pt; }
        .preview-row {
          display: flex; justify-content: space-between;
          align-items: baseline; gap: 8px;
        }
        .preview-right { text-align: right; color: #4b5563; white-space: nowrap; }
        .subheading { margin-top: 6px; margin-bottom: 2px; }
        .subheading-list > .subheading { padding-left: 0; }
        .small { font-size: 9.5pt; }
        .preview-link { color: #1d4ed8; text-decoration: none; }
        .preview-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
