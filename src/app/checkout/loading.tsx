import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main>
      <Container className="py-10">
        <Skeleton className="h-7 w-56" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <Skeleton className="h-4 w-40" />
            <div className="mt-5 grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-10 w-full" />
                </div>
              ))}
              <Skeleton className="mt-2 h-11 w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-36" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

