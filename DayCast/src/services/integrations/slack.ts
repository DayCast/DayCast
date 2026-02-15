const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || "";
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || "";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type SlackOAuthResponse = {
  ok: boolean;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    url: string;
  };
  error?: string;
};

export type SlackChannel = {
  id: string;
  name: string;
  is_member: boolean;
};

export function getSlackOAuthUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
  const redirectUri = `${NEXTAUTH_URL}/api/integrations/slack/callback`;
  const scopes = ["channels:read", "chat:write", "incoming-webhook"].join(",");

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<SlackOAuthResponse> {
  const redirectUri = `${NEXTAUTH_URL}/api/integrations/slack/callback`;

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  try {
    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await res.json()) as SlackOAuthResponse;
    return data;
  } catch (error) {
    console.error("Slack OAuth exchange error:", error);
    return { ok: false, error: "exchange_failed" };
  }
}

export async function sendSlackWebhook(
  webhookUrl: string,
  message: { text: string }
): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return res.ok;
  } catch (error) {
    console.error("Slack webhook error:", error);
    return false;
  }
}

export async function getSlackChannels(accessToken: string): Promise<SlackChannel[]> {
  try {
    const res = await fetch("https://slack.com/api/conversations.list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Slack channels error:", data.error);
      return [];
    }

    return (data.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      is_member: ch.is_member ?? false,
    }));
  } catch (error) {
    console.error("Slack channels fetch error:", error);
    return [];
  }
}
