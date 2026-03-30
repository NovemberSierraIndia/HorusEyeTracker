import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { googleFetch } from "@/lib/google";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await googleFetch(
      "https://www.googleapis.com/gmail/v1/users/me/labels/UNREAD",
      session.accessToken
    );
    return NextResponse.json({ count: data.messagesUnread || 0 });
  } catch {
    // Fallback: count unread from inbox
    try {
      const data = await googleFetch(
        "https://www.googleapis.com/gmail/v1/users/me/labels/INBOX",
        session.accessToken
      );
      return NextResponse.json({ count: data.messagesUnread || 0 });
    } catch {
      return NextResponse.json({ count: 0 });
    }
  }
}
