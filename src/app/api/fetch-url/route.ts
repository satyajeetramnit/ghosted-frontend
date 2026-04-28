import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const EXTRACT_PROMPT = `You are a job description extractor. You will be given raw text scraped from a webpage.
Extract ONLY the job description content — job title, responsibilities, requirements, qualifications, and any relevant job details.
Remove all navigation, ads, headers, footers, cookie notices, and unrelated page content.
Return only the clean job description as plain text. No extra commentary.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured in .env" }, { status: 500 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Malformed URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only http/https URLs are allowed" }, { status: 400 });
  }

  // Fetch the page
  let rawText: string;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResumeBuilder/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: HTTP ${response.status}` }, { status: 502 });
    }
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    if (contentType.includes("text/html")) {
      rawText = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    } else {
      rawText = text.trim();
    }
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 });
  }

  // Use Groq to extract only the job description
  const groq = new Groq({ apiKey });
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: `${EXTRACT_PROMPT}\n\nPage content:\n${rawText.slice(0, 12000)}` },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
    });
    const extracted = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!extracted) {
      return NextResponse.json({ error: "Could not extract job description from the page" }, { status: 502 });
    }
    return NextResponse.json({ content: extracted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Groq API error: ${message}` }, { status: 502 });
  }
}

