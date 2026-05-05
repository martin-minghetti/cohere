"use server";

import { revalidatePath } from "next/cache";
import {
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/lib/subscriptions";

export async function pauseAction(subscriptionId: string) {
  await pauseSubscription(subscriptionId);
  revalidatePath(`/sub/${subscriptionId}`);
}

export async function resumeAction(subscriptionId: string) {
  await resumeSubscription(subscriptionId);
  revalidatePath(`/sub/${subscriptionId}`);
}

export async function cancelAction(subscriptionId: string) {
  await cancelSubscription(subscriptionId);
  revalidatePath(`/sub/${subscriptionId}`);
}
