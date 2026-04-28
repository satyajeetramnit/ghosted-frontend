import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const PROMPT = `You are a LaTeX resume editor. The user will give you a LaTeX resume document and a plain-English instruction describing what to change.

Apply the requested change and return ONLY the complete modified LaTeX document — no explanation, no markdown fences, no extra text.

Rules:
- Return the full LaTeX document with the change applied.
- Preserve all existing content unless explicitly asked to remove something.
- If the instruction is unclear or cannot be applied safely, return the original document unchanged.
- Do not wrap your output in backticks or code fences.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured in .env" },
      { status: 500 }
    );
  }

  let latex: string;
  let instruction: string;
  try {
    const body = await req.json();
    latex = body.latex;
    instruction = body.instruction;
    if (!latex || typeof latex !== "string" || latex.trim().length < 10) {
      return NextResponse.json({ error: "LaTeX content is required" }, { status: 400 });
    }
    if (!instruction || typeof instruction !== "string" || instruction.trim().length < 2) {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: `${PROMPT}\n\nInstruction: ${instruction}\n\nLaTeX document:\n${latex}` },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });
    const updated = (completion.choices[0]?.message?.content ?? "")
      .replace(/^```(?:latex|tex)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    if (!updated || updated.length < 100) {
      return NextResponse.json({ error: "AI returned an empty response" }, { status: 502 });
    }

    return NextResponse.json({ latex: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Groq API error: ${message}` }, { status: 502 });
  }
}
