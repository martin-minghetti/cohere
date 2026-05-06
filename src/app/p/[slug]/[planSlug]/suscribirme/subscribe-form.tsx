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
      className="mt-2 h-12 w-full rounded-md bg-primary text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando suscripción
        </>
      ) : (
        <>
          Confirmar y pagar
          <ArrowRight className="ml-2 h-4 w-4" />
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
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="proSlug" value={proSlug} />
      <input type="hidden" name="planSlug" value={planSlug} />

      <div className="grid gap-2">
        <Label
          htmlFor="subscriberName"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Nombre completo
        </Label>
        <Input
          id="subscriberName"
          name="subscriberName"
          type="text"
          autoComplete="name"
          required
          className="h-11 rounded-md text-[14px]"
        />
        {state.fieldErrors?.subscriberName && (
          <p className="text-[12px] text-destructive">
            {state.fieldErrors.subscriberName}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="subscriberEmail"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Email
        </Label>
        <Input
          id="subscriberEmail"
          name="subscriberEmail"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-md text-[14px]"
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

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Vas a ser redirigido a Mercado Pago para autorizar el cobro mensual.
        Podés cancelar cuando quieras.
      </p>
    </form>
  );
}
