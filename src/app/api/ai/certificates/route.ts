import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a career development advisor for Nicolas, a Master's student in Digital Innovation Management at LUISS Business School in Rome (graduating July 2026). He is targeting senior leadership roles in performance automotive, motorsport, and digital transformation.

Recommend 5 short online courses or certificates that can be completed in 1–2 hours each. They should be free or low-cost, available on platforms like Coursera, LinkedIn Learning, Google, edX, or HubSpot Academy.

Focus areas (mix across these):
- Digital transformation strategy & frameworks
- Data analytics / data-driven decision making
- AI and machine learning applications in industry
- Automotive industry trends (EV, connected cars, autonomous)
- Leadership, strategic thinking, and executive communication
- Project management & agile methodologies

For EACH recommendation, provide:
- name: The exact course title
- platform: Where to find it
- duration: Estimated time (must be 1–2 hours)
- relevance: A 2–3 sentence explanation of WHY this specific course matters for Nicolas's career goals. Connect it to automotive/motorsport industry needs, the skills hiring managers look for, or how it fills a gap between his academic background and industry expectations.
- url: A real URL to the course page (use the actual course URL if you know it, otherwise use a search URL for the platform)

Return ONLY a valid JSON array. No markdown, no code fences, no commentary.`;

export async function POST() {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: "Recommend 5 certificates for my career goals. Make sure they are real, currently available courses." }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from the response (handle potential markdown code fences)
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    const certificates = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Certificates generation error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
