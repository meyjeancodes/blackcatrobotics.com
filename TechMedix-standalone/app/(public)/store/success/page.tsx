export const dynamic = "force-static";

export function generateMetadata() {
  return { title: "Order Confirmed — BlackCat Robotics" };
}

export default function StoreSuccess() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-header text-4xl tracking-[-0.04em] text-theme-primary">Order Confirmed</h1>
      <p className="mt-3 text-sm text-theme-50">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>
      <a href="/store" className="mt-6 inline-block text-sm text-ember hover:text-ember/80">
        Continue Shopping
      </a>
    </main>
  );
}
