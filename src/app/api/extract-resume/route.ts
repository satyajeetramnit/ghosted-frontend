import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const PROMPT = `You are a resume parser. Given resume text (plain text, HTML, or LaTeX), extract all information and return ONLY a valid JSON object matching the schema below. Do not include any markdown fences or extra text — raw JSON only.

Schema:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string (URL, may be empty)",
  "github": "string (URL, may be empty)",
  "portfolio": "string (URL, may be empty)",
  "leetcode": "string (URL, may be empty)",
  "hackerrank": "string (URL, may be empty)",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "location": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "location": "string (may be empty)",
      "gpa": "string (may be empty)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string (URL, may be empty)"
    }
  ]
}

Rules:
- Extract ALL experience bullet points verbatim.
- If a field is not found, use an empty string or empty array.
- Parse dates as written (e.g. "May 2023", "Jan. 2022 - Present").
- For skills, split comma/semicolon-separated lists into individual items.
- Return only raw JSON, no explanation.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured in .env" },
      { status: 500 }
    );
  }

  let resumeText: string;
  try {
    const body = await req.json();
    resumeText = body.text;
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
      return NextResponse.json({ error: "Resume text is too short or missing" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const trimmedText = resumeText.slice(0, 12000);

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: `${PROMPT}\n\nParse this resume:\n\n${trimmedText}` },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: cleaned.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ resume: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Groq API error: ${message}` }, { status: 502 });
  }
}
