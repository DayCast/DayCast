import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotionOAuthUrl } from "@/services/integrations/notion";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=notion_unauthorized")
      );
    }

    const oauthUrl = getNotionOAuthUrl(session.user.id);
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("Notion connect error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=notion_connect_failed")
    );
  }
}
