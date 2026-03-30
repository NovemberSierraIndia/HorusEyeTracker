import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a LinkedIn content strategist for Nicolas, a Master's student in Digital Innovation Management at LUISS Business School in Rome, graduating July 2026. He is targeting senior leadership roles in performance automotive and motorsport digital transformation. His edge is combining deep automotive/motorsport domain knowledge with digital innovation expertise. Generate 3 distinct LinkedIn post drafts. Each post should: be 150–200 words, open with a strong hook, share a genuine insight or perspective on automotive digital transformation, feel like a real professional voice (not AI-generated), and end with a question to drive engagement. Return only the 3 posts, clearly separated with "---" between them.`;

export async function POST(request: Request) {
  try {
    const { topic } = await request.json().catch(() => ({}));
    const userMessage = topic
      ? `Generate 3 LinkedIn posts about: ${topic}`
      : "Generate 3 LinkedIn posts based on my profile.";

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const posts = text.split("---").map((p: string) => p.trim()).filter(Boolean);

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 });
  }
}
