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
    // First try with CATEGORY_PRIMARY, fall back to INBOX only
    let listData;
    try {
      listData = await googleFetch(
        "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX&labelIds=CATEGORY_PRIMARY",
        session.accessToken
      );
    } catch {
      // CATEGORY_PRIMARY might not exist — fall back to INBOX only
      listData = await googleFetch(
        "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX",
        session.accessToken
      );
    }

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await Promise.all(
      listData.messages.map(async (msg: { id: string; threadId: string }) => {
        const detail = await googleFetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          session.accessToken
        );
        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
        return {
          id: msg.id,
          threadId: msg.threadId,
          from: getHeader("From"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          snippet: detail.snippet,
          isUnread: (detail.labelIds || []).includes("UNREAD"),
        };
      })
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[HorusEye] Gmail inbox error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}
