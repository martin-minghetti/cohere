"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitSubscriptionAction,
  type SubscribeFormState,
} from "./actions";

const initialState: SubscribeFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-1 h-10 w-full rounded-md text-[13px] font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          Generating subscription...
        </>
      ) : (
        <>
          Confirm and pay
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </>
      )}
    </Button>
  );
}

export function SubscribeForm({
  proSlug,
  planSlug,
}: {
  proSlug: string;
  planSlug: string;
}) {
  const [state, formAction] = useActionState(
    submitSubscriptionAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="proSlug" value={proSlug} />
      <input type="hidden" name="planSlug" value={planSlug} />

      <div className="grid gap-1.5">
        <Label
          htmlFor="subscriberName"
          className="text-[12px] font-medium text-muted-foreground"
        >
          Full name
        </Label>
        <Input
          id="subscriberName"
          name="subscriberName"
          type="text"
          autoComplete="name"
          required
          className="h-10 rounded-md text-[13px]"
        />
        {state.fieldErrors?.subscriberName && (
          <p className="text-[12px] text-destructive">
            {state.fieldErrors.subscriberName}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor="subscriberEmail"
          className="text-[12px] font-medium text-muted-foreground"
        >
          Email
        </Label>
        <Input
          id="subscriberEmail"
          name="subscriberEmail"
          type="email"
          autoComplete="email"
          required
          className="h-10 rounded-md text-[13px]"
        />
        {state.fieldErrors?.subscriberEmail && (
          <p className="text-[12px] text-destructive">
            {state.fieldErrors.subscriberEmail}
          </p>
        )}
      </div>

      {state.error && !state.fieldErrors && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        You will be redirected to Mercado Pago to authorize the monthly charge.
        Cancel anytime.
      </p>
    </form>
  );
}
