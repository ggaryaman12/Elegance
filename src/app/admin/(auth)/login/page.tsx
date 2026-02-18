import { LoginForm } from "@/components/admin/login-form";
import { Container } from "@/components/site/container";

export default function AdminLoginPage() {
  return (
    <main>
      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
          <p className="mt-1 text-sm text-mutedForeground">
            Sign in to manage products, reels, and orders.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </Container>
    </main>
  );
}

