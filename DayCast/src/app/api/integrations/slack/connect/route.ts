import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSlackOAuthUrl } from "@/services/integrations/slack";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    }

    const oauthUrl = getSlackOAuthUrl(session.user.id);
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("Slack connect error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=slack_connect_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}
