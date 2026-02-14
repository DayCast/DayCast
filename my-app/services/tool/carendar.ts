// src/services/tools/calendar.ts
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getValidAccessToken } from '@/lib/google-token';
import { google } from 'googleapis';

/**
 * ユーザーのアクセストークンを取得してGoogle Calendarクライアントを初期化する
 */
async function getGoogleCalendarClient(userId: string) {
  const account = await prisma.oAuthAccount.findFirst({
    where: { userId, provider: 'google' },
  });
  const accessToken = await getValidAccessToken(userId);
  const auth = new google.auth.OAuth2();

  auth.setCredentials({ access_token: accessToken });


  if (!account || !account.accessToken) {
    throw new Error('Google連携が設定されていません');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: account.accessToken });
  
  return google.calendar({ version: 'v3', auth });
}

/**
 * 予定を取得するツール（AIが呼び出す用）
 */
export async function listEvents(userId: string, timeMin: string) {
  const calendar = await getGoogleCalendarClient(userId);
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

/**
 * 予定を作成するツール（AIが呼び出す用）
 */
export async function createEvent(userId: string, eventData: any) {
  const calendar = await getGoogleCalendarClient(userId);
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.title,
      location: eventData.location,
      description: eventData.description,
      start: { dateTime: eventData.startTime },
      end: { dateTime: eventData.endTime },
    },
  });

  return response.data;
}