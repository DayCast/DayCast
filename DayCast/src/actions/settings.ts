"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function updateUserProfile(name: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateUserSettings(settings: {
  timezone?: string;
  enableNotifications?: boolean;
  aiAutoMode?: boolean;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: settings,
    create: {
      userId: session.user.id,
      ...settings,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getUserSettings() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return settings;
}
