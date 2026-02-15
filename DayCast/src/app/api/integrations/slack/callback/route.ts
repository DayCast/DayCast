import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeSlackCode } from "@/services/integrations/slack";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=slack_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=slack_invalid_params", request.url)
      );
    }

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=slack_invalid_state", request.url)
      );
    }

    const tokenResponse = await exchangeSlackCode(code);

    if (tokenResponse.error || !tokenResponse.access_token) {
      console.error("Slack OAuth error:", tokenResponse.error);
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=slack_token_exchange", request.url)
      );
    }

    await prisma.userSettings.upsert({
      where: { userId },
      update: {
        slackAccessToken: tokenResponse.access_token,
        slackTeamId: tokenResponse.team?.id || null,
        slackTeamName: tokenResponse.team?.name || null,
      },
      create: {
        userId,
        slackAccessToken: tokenResponse.access_token,
        slackTeamId: tokenResponse.team?.id || null,
        slackTeamName: tokenResponse.team?.name || null,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=slack", request.url)
    );
  } catch (error) {
    console.error("Slack callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=slack_unknown", request.url)
    );
  }
}
