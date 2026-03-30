import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a career development advisor for Nicolas, a Master's student in Digital Innovation Management at LUISS Business School, targeting senior roles in automotive digital transformation and motorsport. Recommend 5 short certificates or courses (1–2 hours each, free or low-cost) available on platforms like Coursera, LinkedIn Learning, Google, or edX. Focus on: digital transformation, data strategy, automotive industry trends, AI in manufacturing, or leadership. For each, provide: course name, platform, estimated time, a 1-sentence explanation of why it's relevant to his goals. Format as JSON array with fields: name, platform, duration, relevance, url.`;

export async function POST() {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: "Recommend 5 certificates for my career goals." }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const certificates = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ certificates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
