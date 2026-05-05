"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  subscriptionInputSchema,
  createSubscription,
} from "@/lib/subscriptions";

export type SubscribeFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitSubscriptionAction(
  _prev: SubscribeFormState,
  formData: FormData,
): Promise<SubscribeFormState> {
  const raw = {
    proSlug: formData.get("proSlug"),
    planSlug: formData.get("planSlug"),
    subscriberName: formData.get("subscriberName"),
    subscriberEmail: formData.get("subscriberEmail"),
  };

  const parsed = subscriptionInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    const flatten = z.flattenError(parsed.error).fieldErrors;
    for (const [key, msgs] of Object.entries(flatten)) {
      if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
    }
    return { ok: false, fieldErrors, error: "Revisá los datos del formulario" };
  }

  const result = await createSubscription(parsed.data);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect(result.redirectUrl);
}
