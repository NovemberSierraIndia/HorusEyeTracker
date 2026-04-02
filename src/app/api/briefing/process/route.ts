import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are the executive assistant of Nicolas Salois-Ishak. He is a Master's student in Digital Innovation Management at LUISS Business School in Rome, graduating July 2026. He is targeting senior roles in automotive digital transformation and motorsport. He has prior experience at Forvia and Alpine (F1 and Cars). He is actively in contact with Horse Powertrain (a Renault-Geely JV) regarding roles from July 2026, with a key contact at Horse Tech in Madrid. His current courses include Digital Product/Solution Development (Prof. Pressi) and Business Transformation Playbook (Prof. Ibarra). His thesis is on digital innovation in hyper-luxury automotive brands. Key contacts include: Prof. Fabio Pressi, Salvatore Grasso (ST Microelectronics, mentor), Fawad Bajwa (guest speaker contact), and his Horse Tech Madrid contact.

When given raw notes, respond ONLY with a valid JSON object — no markdown, no explanation, no preamble. The JSON must have exactly this structure:

{
  "title": "A short 3-6 word title for this briefing (e.g. 'Fintech Lab: Blockchain Fundamentals')",
  "summary": "Each bullet point on its own line, prefixed with '- '. Write 3-8 concise bullet points. Each should be one clear sentence. Capture key insights, decisions, open questions, and action items.",
  "events": [
    {
      "title": "Event title",
      "date": "YYYY-MM-DD or null if unclear",
      "time": "HH:MM or null",
      "description": "Brief context from the notes",
      "confidence": "high | medium | low"
    }
  ],
  "drafts": [
    {
      "to": "Recipient name or email if mentioned",
      "subject": "Email subject",
      "body": "Full professional email draft ready to send. Match Nicolas's tone: direct, confident, concise.",
      "context": "One line explaining why this email was detected"
    }
  ],
  "tags": ["class", "meeting", "career", "personal", "thesis"]
}

If no events are detected, return an empty array for events. Same for drafts. Always return all four keys.`;

export async function POST(request: Request) {
  try {
    const { notes } = await request.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "No notes provided" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: notes }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON — handle potential markdown fences
    const cleaned = text
      .replace(/```json?\s*/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[HorusEye] Briefing process error:", error);
    return NextResponse.json(
      { error: "Failed to process notes. The AI response may have been malformed." },
      { status: 500 }
    );
  }
}
