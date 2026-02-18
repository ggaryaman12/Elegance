import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main>
      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-b-none" />
            <div className="grid grid-cols-5 gap-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="mt-3 h-6 w-32" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-2/3" />

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-32" />
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24" />
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

