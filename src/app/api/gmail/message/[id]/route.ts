import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { googleFetch } from "@/lib/google";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const detail = await googleFetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${params.id}?format=full`,
      session.accessToken
    );

    const headers = detail.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

    let body = "";
    if (detail.payload?.body?.data) {
      body = Buffer.from(detail.payload.body.data, "base64url").toString("utf-8");
    } else if (detail.payload?.parts) {
      const textPart = detail.payload.parts.find(
        (p: any) => p.mimeType === "text/plain"
      );
      const htmlPart = detail.payload.parts.find(
        (p: any) => p.mimeType === "text/html"
      );
      const part = textPart || htmlPart;
      if (part?.body?.data) {
        body = Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
    }

    return NextResponse.json({
      id: detail.id,
      from: getHeader("From"),
      subject: getHeader("Subject"),
      date: getHeader("Date"),
      body,
      isHtml: !detail.payload?.parts?.find((p: any) => p.mimeType === "text/plain"),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
  }
}
