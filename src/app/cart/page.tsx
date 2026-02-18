import { Container } from "@/components/site/container";
import { CartView } from "@/components/shop/cart-view";

export default function CartPage() {
  return (
    <main>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
        <CartView />
      </Container>
    </main>
  );
}

