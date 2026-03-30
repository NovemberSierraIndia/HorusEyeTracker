import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a professional communication coach for Nicolas, a trilingual (French, English, Italian) Master's student in Digital Innovation Management at LUISS, with prior internships at Forvia and Alpine (F1, Cars, Endurance). He is targeting senior roles in automotive digital transformation. Based on the outreach target and context provided, write one polished professional email (subject + body, under 200 words) and three alternative conversation starters. Tone: confident, specific, non-generic. Never use phrases like "I hope this finds you well." Format your response as:

SUBJECT: [subject line]

EMAIL:
[email body]

CONVERSATION STARTERS:
1. [starter 1]
2. [starter 2]
3. [starter 3]`;

export async function POST(request: Request) {
  try {
    const { target, context } = await request.json();

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Target: ${target}\nContext: ${context}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the structured response
    const subjectMatch = text.match(/SUBJECT:\s*(.+)/);
    const emailMatch = text.match(/EMAIL:\s*([\s\S]*?)(?=CONVERSATION STARTERS:)/);
    const startersMatch = text.match(/CONVERSATION STARTERS:\s*([\s\S]*)/);

    const subject = subjectMatch?.[1]?.trim() || "";
    const email = emailMatch?.[1]?.trim() || "";
    const startersText = startersMatch?.[1]?.trim() || "";
    const starters = startersText
      .split(/\n/)
      .map((s: string) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    return NextResponse.json({ subject, email, starters });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate outreach" }, { status: 500 });
  }
}
