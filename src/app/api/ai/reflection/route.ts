import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a direct, honest executive coach. Nicolas has just completed his weekly review. Read his answers and respond with: 1) one genuine observation about his week (not praise, not harsh — truthful), 2) one pattern you notice across his answers, 3) one specific, uncomfortable challenge for next week. Be concise. Maximum 4 sentences total. Do not be motivational-poster generic.`;

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();

    const userMessage = `Here are my weekly review answers:

1. Most important win: ${answers.win}
2. Uncomfortable action taken or avoided: ${answers.uncomfortable}
3. Career progress: ${answers.careerForward}
4. Time wasted on: ${answers.wastedTime}
5. Alignment score (1-10): ${answers.alignmentScore}
6. Non-negotiable next week: ${answers.nextWeekAction}
7. Underrated result: ${answers.underratedResult}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reflection: text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate reflection" }, { status: 500 });
  }
}
