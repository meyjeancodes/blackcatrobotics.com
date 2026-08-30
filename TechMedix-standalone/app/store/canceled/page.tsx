export const dynamic = "force-static";

export function generateMetadata() {
  return { title: "Checkout Canceled — BlackCat Robotics" };
}

export default function StoreCanceled() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Checkout Canceled — BlackCat Robotics",
  };
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "96px 20px 80px",
        fontFamily: "'Satoshi', 'Helvetica Neue', sans-serif",
        color: "#0a0a0f",
        textAlign: "center",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="/"
        style={{ color: "#cc3d17", textDecoration: "none", fontSize: 14 }}
      >
        &larr; Back to TechMedix
      </a>
      <div
        style={{
          fontFamily: "'Tanker', sans-serif",
          fontSize: 56,
          margin: "40px 0 12px",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Checkout Canceled.
      </div>
      <p
        style={{
          fontSize: 16,
          color: "#3a3a45",
          lineHeight: 1.7,
          maxWidth: 480,
          margin: "0 auto 32px",
        }}
      >
        Your cart is still saved. Ready to complete your order? Head back to the
        shop.
      </p>
      <a
        href="/shop.html"
        style={{
          background: "#0a0a0f",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "12px 28px",
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Return to Shop
      </a>
    </main>
  );
}
