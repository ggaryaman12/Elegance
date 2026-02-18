import { Container } from "@/components/site/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main>
      <Container className="py-10">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-3 h-4 w-96" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card">
              <Skeleton className="aspect-[4/3] w-full rounded-b-none" />
              <div className="p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

