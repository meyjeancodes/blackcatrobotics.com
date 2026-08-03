export const dynamic = "force-static";

export default function StoreSuccessPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "120px 20px 80px", textAlign: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "#1db954",
          color: "#fff",
          fontSize: 28,
          lineHeight: "56px",
          margin: "0 auto 20px",
        }}
      >
        ✓
      </div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 34, marginBottom: 12 }}>Order confirmed</h1>
      <p style={{ color: "#3a3a45", fontSize: 16, lineHeight: 1.7 }}>
        Thank you. Your aftermarket part order is in. We&apos;ll email fulfilment and tracking details
        shortly. Most H1 parts ship in 3–10 business days.
      </p>
      <p style={{ marginTop: 28 }}>
        <a href="/store" style={{ color: "#cc3d17", marginRight: 16 }}>Back to store</a>
        <a href="/" style={{ color: "#0a0a0f" }}>Back to home</a>
      </p>
    </main>
  );
}
