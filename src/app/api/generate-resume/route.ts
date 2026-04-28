import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const PROMPT = `You are a professional resume writer. Given a user's profile, their saved work experience/education/projects, and a job description, produce a tailored resume JSON object.

Return ONLY a valid JSON object matching the schema below. No markdown fences, no explanation — raw JSON only.

Schema:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "github": "string",
  "portfolio": "string",
  "leetcode": "string",
  "hackerrank": "string",
  "summary": "string (2-3 sentences, tailored to the job)",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "location": "string",
      "bullets": ["string (3-5 achievement-oriented bullets, tailored to job description, use metrics where possible)"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "location": "string",
      "gpa": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (1-2 sentences, highlight relevance to job)",
      "technologies": ["string"],
      "link": "string"
    }
  ]
}

Rules:
- Use the profile data for personal info (name, email, phone, etc.).
- Generate a tailored professional summary based on the job description and the user's background.
- For each experience entry, write 3-5 achievement-oriented bullet points that highlight skills relevant to the job description. Use STAR format with metrics when possible.
- For each project, write a concise description and infer relevant technologies from the project name and job description context.
- Skills should be a flat list of individual skills relevant to the job, drawn from the user's background.
- Keep all personal info fields exactly as provided — do not invent contact details.
- Return only raw JSON.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured in .env" },
      { status: 500 }
    );
  }

  let body: {
    jobDescription: string;
    profile: Record<string, string>;
    template: {
      experiences: { company: string; title: string; startDate: string; endDate: string; location: string }[];
      education: { institution: string; degree: string; field: string; graduationDate: string; location?: string; gpa?: string; coursework?: string }[];
      projects: { name: string; link?: string }[];
    };
  };

  try {
    body = await req.json();
    if (!body.jobDescription || typeof body.jobDescription !== "string" || body.jobDescription.trim().length < 10) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { jobDescription, profile, template } = body;

  const contextPayload = `
USER PROFILE:
${JSON.stringify(profile, null, 2)}

WORK EXPERIENCE TEMPLATES (structure only — you generate the bullet points):
${JSON.stringify(template.experiences, null, 2)}

EDUCATION:
${JSON.stringify(template.education, null, 2)}

PROJECTS (name and link only — you generate descriptions and technologies):
${JSON.stringify(template.projects, null, 2)}

JOB DESCRIPTION:
${jobDescription.slice(0, 6000)}
`.trim();

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: `${PROMPT}\n\n${contextPayload}` },
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
