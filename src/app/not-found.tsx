import { Container } from "@/components/site/container";
import { TransitionLink } from "@/components/site/transition-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main>
      <Container className="py-14">
        <div className="mx-auto max-w-xl">
          <Card className="p-8">
            <div className="text-sm font-semibold text-mutedForeground">
              404
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Page not found
            </h1>
            <p className="mt-2 text-sm text-mutedForeground">
              The page you’re looking for doesn’t exist.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <TransitionLink href="/products">Browse suits</TransitionLink>
              </Button>
              <Button asChild variant="secondary">
                <TransitionLink href="/">Go home</TransitionLink>
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
