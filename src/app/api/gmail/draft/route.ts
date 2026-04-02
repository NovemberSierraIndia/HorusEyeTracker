import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, subject, body } = await request.json();

    // Build RFC 2822 email
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ];
    const rawEmail = emailLines.join("\r\n");

    // Base64url encode
    const encoded = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/drafts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: { raw: encoded },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[HorusEye] Gmail draft error:", errBody);
      return NextResponse.json(
        { error: "Failed to create Gmail draft" },
        { status: 500 }
      );
    }

    const draft = await res.json();
    return NextResponse.json({ draft });
  } catch (error) {
    console.error("[HorusEye] Gmail draft error:", error);
    return NextResponse.json(
      { error: "Failed to create Gmail draft" },
      { status: 500 }
    );
  }
}
