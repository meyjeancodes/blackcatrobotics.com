export const dynamic = "force-static";

export default function StoreCancelPage() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "120px 20px 80px",
        textAlign: "center",
        fontFamily: "'Satoshi', 'Helvetica Neue', sans-serif",
        color: "#0a0a0f",
      }}
    >
      <h1 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 34, marginBottom: 12, letterSpacing: "-0.02em" }}>
        Checkout canceled
      </h1>
      <p style={{ color: "#3a3a45", fontSize: 16, lineHeight: 1.7 }}>
        No charge was made. You can return to the store and try again whenever you&apos;re ready.
      </p>
      <p style={{ marginTop: 28 }}>
        <a href="/store" style={{ color: "#cc3d17" }}>Return to store</a>
      </p>
    </main>
  );
}
