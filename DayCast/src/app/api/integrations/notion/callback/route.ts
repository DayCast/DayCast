import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeNotionCode } from "@/services/integrations/notion";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=notion_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=notion_invalid_params", request.url)
      );
    }

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=notion_invalid_state", request.url)
      );
    }

    const tokenResponse = await exchangeNotionCode(code);

    if (tokenResponse.error || !tokenResponse.access_token) {
      console.error("Notion OAuth error:", tokenResponse.error);
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=notion_token_exchange", request.url)
      );
    }

    await prisma.userSettings.upsert({
      where: { userId },
      update: {
        notionAccessToken: tokenResponse.access_token,
        notionWorkspaceId: tokenResponse.workspace_id || null,
        notionWorkspaceName: tokenResponse.workspace_name || null,
      },
      create: {
        userId,
        notionAccessToken: tokenResponse.access_token,
        notionWorkspaceId: tokenResponse.workspace_id || null,
        notionWorkspaceName: tokenResponse.workspace_name || null,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=notion", request.url)
    );
  } catch (error) {
    console.error("Notion callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=notion_unknown", request.url)
    );
  }
}
