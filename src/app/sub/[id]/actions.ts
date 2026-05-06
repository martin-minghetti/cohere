"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/lib/subscriptions";
import { validatePortalToken } from "@/lib/subscription-token";

async function withPortalAuth(
  subscriptionId: string,
  token: string,
  fn: () => Promise<void>,
): Promise<void> {
  const validation = validatePortalToken(subscriptionId, token);
  if (!validation.ok) {
    redirect("/");
  }
  await fn();
  revalidatePath(`/sub/${subscriptionId}`);
}

export async function pauseAction(subscriptionId: string, token: string) {
  await withPortalAuth(subscriptionId, token, () =>
    pauseSubscription(subscriptionId),
  );
}

export async function resumeAction(subscriptionId: string, token: string) {
  await withPortalAuth(subscriptionId, token, () =>
    resumeSubscription(subscriptionId),
  );
}

export async function cancelAction(subscriptionId: string, token: string) {
  await withPortalAuth(subscriptionId, token, () =>
    cancelSubscription(subscriptionId),
  );
}
