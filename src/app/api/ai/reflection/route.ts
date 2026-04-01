import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a direct, insightful personal coach for Nicolas, a Master's student targeting senior roles in automotive/motorsport. You're analyzing his daily journal entries to give him actionable feedback.

Structure your response in two clear sections:

**What you're doing well:**
- Identify 2-3 genuine strengths or positive patterns you see across the entries (be specific, reference actual things he wrote)

**What to work on:**
- Identify 2-3 areas for improvement or patterns to watch (be honest but constructive, reference actual entries)

End with one specific, actionable challenge for the coming week.

Be concise and genuine — no motivational-poster language. Reference specific entries and patterns. Maximum 250 words.`;

export async function POST(request: Request) {
  try {
    const { entries } = await request.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No journal entries provided" }, { status: 400 });
    }

    const entriesText = entries
      .slice(0, 30) // limit to last 30 entries to stay within token limits
      .map(
        (e: { dateKey: string; mood: number; doneGreat: string; wins: string; doneBetter: string; gratefulFor: string }) =>
          `--- ${e.dateKey} (Mood: ${e.mood}/10) ---
Great today: ${e.doneGreat || "(empty)"}
Wins: ${e.wins || "(empty)"}
Could do better: ${e.doneBetter || "(empty)"}
Grateful for: ${e.gratefulFor || "(empty)"}`
      )
      .join("\n\n");

    const userMessage = `Here are my recent daily journal entries:\n\n${entriesText}\n\nAnalyze my patterns and give me feedback.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ insights: text });
  } catch (error) {
    console.error("Journal insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
