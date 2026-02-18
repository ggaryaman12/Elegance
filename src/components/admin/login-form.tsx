"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

import { adminLogin } from "@/app/admin/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(adminLogin, { error: undefined });

  return (
    <Card className="p-6">
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="owner@shop.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error ? (
          <div className="rounded-xl border border-border bg-muted px-3 py-2 text-sm">
            {state.error}
          </div>
        ) : null}
        <SubmitButton />
        <p className="text-xs text-mutedForeground">
          Tip: set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_PASSWORD` in
          `.env.local`.
        </p>
      </form>
    </Card>
  );
}

