const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || "";
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || "";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export type NotionOAuthResponse = { access_token: string; token_type: string; bot_id: string; workspace_id: string; workspace_name?: string; error?: string };
export type NotionDatabase = { id: string; title: string; icon?: string; url: string };
export type NotionTodo = { id: string; title: string; status: "pending" | "in_progress" | "completed"; dueDate?: string; priority?: "low" | "medium" | "high" };
export type Todo = { id: string; title: string; status: string; dueDate?: Date | null; priority?: string | null };

export function getNotionOAuthUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
  const redirectUri = `${NEXTAUTH_URL}/api/integrations/notion/callback`;
  const params = new URLSearchParams({ client_id: NOTION_CLIENT_ID, redirect_uri: redirectUri, response_type: "code", owner: "user", state });
  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

export async function exchangeNotionCode(code: string): Promise<NotionOAuthResponse> {
  const credentials = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64");
  const redirectUri = `${NEXTAUTH_URL}/api/integrations/notion/callback`;
  const res = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${credentials}`, "Notion-Version": "2022-06-28" },
    body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  return (await res.json()) as NotionOAuthResponse;
}

export async function getNotionDatabases(accessToken: string): Promise<NotionDatabase[]> {
  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, "Notion-Version": "2022-06-28" },
    body: JSON.stringify({ filter: { property: "object", value: "database" } }),
  });
  const data = await res.json();
  if (data.error) return [];
  return data.results.map((db: any) => ({ id: db.id, title: db.title?.[0]?.plain_text || "Untitled", icon: db.icon?.emoji, url: db.url }));
}

export async function getTodosFromNotion(accessToken: string, databaseId: string): Promise<NotionTodo[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, "Notion-Version": "2022-06-28" },
    body: JSON.stringify({ page_size: 100 }),
  });
  const data = await res.json();
  if (data.error) return [];
  return data.results.map((page: any) => {
    const props = page.properties;
    let title = ""; for (const k in props) if (props[k].type === "title") { title = props[k].title?.[0]?.plain_text || ""; break; }
    let status: "pending" | "in_progress" | "completed" = "pending";
    if (props.Status?.status?.name?.includes("Done")) status = "completed";
    return { id: page.id, title, status };
  });
}

export async function syncTodosToNotion(accessToken: string, databaseId: string, todos: Todo[]): Promise<void> {
  for (const todo of todos) {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ parent: { database_id: databaseId }, properties: { Name: { title: [{ text: { content: todo.title } }] } } }),
    });
  }
}
