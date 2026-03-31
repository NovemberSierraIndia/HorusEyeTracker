import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a LinkedIn content strategist for Nicolas, a Master's student in Digital Innovation Management at LUISS Business School in Rome, graduating July 2026. He is targeting senior leadership roles in performance automotive and motorsport digital transformation. His edge is combining deep automotive/motorsport domain knowledge with digital innovation expertise.

Rules for every post:
- 150–200 words
- Open with a strong, scroll-stopping hook (no generic openers)
- Share a genuine insight or perspective — feel like a real professional voice, NOT AI-generated
- End with a question or call-to-action to drive engagement
- Do NOT use hashtags unless they feel natural (max 3)
- Avoid clichés like "In today's fast-paced world" or "Here's the thing"

Return ONLY the 3 posts, clearly separated with "---" between them. No labels, no numbering, no extra commentary.`;

export async function POST(request: Request) {
  try {
    const { topic, tone, audience } = await request.json().catch(() => ({} as Record<string, string>));

    let userMessage = topic
      ? `Generate 3 LinkedIn posts about: ${topic}`
      : "Generate 3 LinkedIn posts based on my profile and current automotive/motorsport trends.";

    if (tone && tone !== "professional") {
      const toneGuide: Record<string, string> = {
        "thought-leadership": "Write with authority and forward-thinking vision. Position Nicolas as someone who sees where the industry is heading.",
        "storytelling": "Use narrative structure — a personal anecdote, lesson learned, or behind-the-scenes moment. Make it relatable and human.",
        "bold": "Be provocative and contrarian. Challenge conventional thinking in the automotive/motorsport industry. Strong opinions, backed by reasoning.",
      };
      userMessage += `\n\nTone: ${toneGuide[tone] || tone}`;
    }

    if (audience) {
      userMessage += `\n\nTarget audience: ${audience}. Tailor the language, references, and value proposition to resonate specifically with this group.`;
    }

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
    console.error("LinkedIn generation error:", error);
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 });
  }
}
