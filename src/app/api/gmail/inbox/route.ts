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
    const listData = await googleFetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX&labelIds=CATEGORY_PRIMARY",
      session.accessToken
    );

    const messages = await Promise.all(
      (listData.messages || []).map(async (msg: any) => {
        const detail = await googleFetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          session.accessToken
        );
        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
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
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}
