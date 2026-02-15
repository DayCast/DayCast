import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodoPageContent } from "@/components/todo/todo-page-content";

export default async function TodosPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { aiScore: "desc" },
  });

  return <TodoPageContent todos={todos} />;
}
