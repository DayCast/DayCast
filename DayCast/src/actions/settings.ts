"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateAISettings(provider: string, model: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { aiProvider: provider, aiModel: model },
    create: {
      userId: session.user.id,
      aiProvider: provider,
      aiModel: model,
    },
  });

  return { success: true };
}
