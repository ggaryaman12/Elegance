import { Card } from "@/components/ui/card";

function Section({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-2xl border border-border bg-card"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold">
        <div className="flex items-center justify-between gap-4">
          <span>{title}</span>
          <span className="text-mutedForeground transition-transform group-open:rotate-180">
            ▼
          </span>
        </div>
      </summary>
      <div className="px-5 pb-5 pt-1 text-sm text-mutedForeground">{children}</div>
    </details>
  );
}

export function ProductSections({
  details,
  materialsCare,
  deliveryPayment
}: {
  details?: string | null;
  materialsCare?: string | null;
  deliveryPayment?: string | null;
}) {
  const detailsText = (details ?? "").trim();
  const materialsText = (materialsCare ?? "").trim();
  const deliveryText = (deliveryPayment ?? "").trim();

  return (
    <div className="space-y-3">
      <Section title="Product details" defaultOpen>
        {detailsText ? (
          <p className="whitespace-pre-wrap">{detailsText}</p>
        ) : (
          <p className="whitespace-pre-wrap">
            Details will be added soon.
          </p>
        )}
      </Section>
      <Section title="Materials & care">
        {materialsText ? (
          <p className="whitespace-pre-wrap">{materialsText}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            <li>Care instructions: Dry clean recommended</li>
            <li>Store on hanger; avoid direct sunlight</li>
            <li>Steam iron for best finish</li>
          </ul>
        )}
      </Section>
      <Section title="Delivery & payment">
        {deliveryText ? (
          <p className="whitespace-pre-wrap">{deliveryText}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            <li>Cash on Delivery (COD) only</li>
            <li>No shipping rules configured (as requested)</li>
            <li>We’ll confirm your order by phone</li>
          </ul>
        )}
      </Section>
    </div>
  );
}
