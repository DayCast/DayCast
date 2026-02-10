// src/lib/google-token.ts
import { prisma } from "@/lib/prisma";

export async function getValidAccessToken(userId: string) {
  // 1. DBからアカウント情報を取得
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account || !account.refresh_token) {
    throw new Error("リフレッシュトークンが見つかりません。再ログインが必要です。");
  }

  // 2. 有効期限をチェック (現在時刻 + 余裕分5分)
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at > now + 300) {
    return account.access_token; // まだ有効ならそのまま返す
  }

  // 3. 期限切れの場合、Google APIを叩いて更新
  console.log("トークンが期限切れのため、リフレッシュを実行します...");
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    throw new Error("トークンのリフレッシュに失敗しました");
  }

  // 4. 新しいトークンをDBに保存
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
      // 新しいリフレッシュトークンが送られてきた場合のみ更新
      refresh_token: tokens.refresh_token ?? account.refresh_token,
    },
  });

  return tokens.access_token;
}