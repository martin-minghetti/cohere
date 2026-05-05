import { z } from "zod";

export const subscriptionInputSchema = z.object({
  proSlug: z.string().min(1),
  planSlug: z.string().min(1),
  subscriberName: z.string().min(2, "Ingresá tu nombre completo"),
  subscriberEmail: z.string().email("Email inválido"),
});

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;
