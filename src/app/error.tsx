"use client";

import * as React from "react";
import Link from "next/link";

import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <Container className="py-14">
            <div className="mx-auto max-w-xl">
              <Card className="p-8">
                <div className="text-sm font-semibold text-mutedForeground">
                  Something went wrong
                </div>
                <div className="mt-2 text-sm text-mutedForeground">
                  {error.message}
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" onClick={() => reset()}>
                    Try again
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/">Go home</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </main>
      </body>
    </html>
  );
}

