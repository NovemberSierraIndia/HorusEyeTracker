import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a LinkedIn content strategist for Nicolas, a Master's student in Digital Innovation Management at LUISS Business School, targeting senior roles in automotive digital transformation and motorsport.

You will receive Nicolas's past LinkedIn posts. Analyze them to identify:
- Recurring themes and topics he's passionate about
- His unique angles and perspectives
- Gaps — topics he hasn't covered yet but should, given his career goals
- Natural follow-ups to previous posts that would build his thought leadership

Generate exactly 6 topic suggestions. Each should be:
- A concise phrase (5-10 words max) that works as a post topic
- Mix of: 2 that build on themes from his past posts, 2 that explore new angles related to his interests, 2 that fill strategic gaps for his career goals

Return ONLY a JSON array of 6 strings. No markdown, no code fences, no commentary.`;

export async function POST(request: Request) {
  try {
    const { pastPosts } = await request.json();

    if (!pastPosts || pastPosts.length === 0) {
      return NextResponse.json({ error: "No past posts provided" }, { status: 400 });
    }

    const postsText = pastPosts
      .map((p: string, i: number) => `--- Post ${i + 1} ---\n${p}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Here are my past LinkedIn posts:\n\n${postsText}\n\nSuggest 6 new topics I should write about next.` }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    const topics: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Topic suggestion error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
