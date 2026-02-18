import { Container } from "@/components/site/container";
import { CheckoutForm } from "@/components/shop/checkout-form";

export default function CheckoutPage() {
  return (
    <main>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout (COD)</h1>
        <CheckoutForm />
      </Container>
    </main>
  );
}

