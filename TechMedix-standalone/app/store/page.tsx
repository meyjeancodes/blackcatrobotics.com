import { STORE_PARTS } from "@/lib/store/parts-catalog";

export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://blackcatrobotics.com";

export default function StorePage() {
  const parts = STORE_PARTS;
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "96px 20px 80px" }}>
      <a href="/" style={{ color: "#cc3d17", textDecoration: "none", fontSize: 14 }}>
        &larr; Back to BlackCat Robotics
      </a>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, margin: "20px 0 8px" }}>
        Aftermarket Parts
      </h1>
      <p style={{ color: "#3a3a45", fontSize: 16, lineHeight: 1.7, maxWidth: 620, marginBottom: 36 }}>
        Genuine Unitree H1 replacement parts, sourced by BlackCat Robotics and tied to documented
        TechMedix failure modes. Replace before it breaks — not after.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        <div style={{ border: "1px solid rgba(10,10,15,0.1)", borderRadius: 16, padding: 20, background: "#fff" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 6 }}>Genuine only</div>
          <p style={{ fontSize: 13, color: "#3a3a45", margin: 0, lineHeight: 1.6 }}>Factory-calibrated parts, not third-party copies. Every SKU maps to a documented failure mode.</p>
        </div>
        <div style={{ border: "1px solid rgba(10,10,15,0.1)", borderRadius: 16, padding: 20, background: "#fff" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 6 }}>TechMedix-linked</div>
          <p style={{ fontSize: 13, color: "#3a3a45", margin: 0, lineHeight: 1.6 }}>If your fleet runs TechMedix, we flag the part before it fails and ship it the same week.</p>
        </div>
        <div style={{ border: "1px solid rgba(10,10,15,0.1)", borderRadius: 16, padding: 20, background: "#fff" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 6 }}>Fast lead times</div>
          <p style={{ fontSize: 13, color: "#3a3a45", margin: 0, lineHeight: 1.6 }}>3–10 business days. Install guides included. Calibration support via TechMedix.</p>
        </div>
      </div>

      <div style={{ background: "#0a0a0f", color: "#fff", borderRadius: 20, padding: "32px 28px", marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, marginBottom: 4 }}>Run a fleet? Monitor it with TechMedix.</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, maxWidth: 520 }}>TechMedix predicts part wear and tells you exactly what to order. Pair the store with the dashboard.</p>
        </div>
        <a href="https://dashboard.blackcatrobotics.com/signup" target="_blank" rel="noopener" style={{ background: "#cc3d17", color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Start TechMedix →</a>
      </div>

      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: "0 0 18px" }}>Shop H1 parts</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {parts.map((p) => (
          <div
            key={p.sku}
            style={{
              border: "1px solid rgba(10,10,15,0.1)",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 150, background: "#15171d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${SITE}${p.image}`} alt={p.name} style={{ height: 90, objectFit: "contain" }} />
            </div>
            <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cc3d17" }}>
                {p.manufacturer}
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, margin: "4px 0 8px" }}>{p.name}</h2>
              <p style={{ fontSize: 13, color: "#3a3a45", lineHeight: 1.6, marginBottom: 12 }}>{p.description}</p>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Lead time: {p.leadTime}</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>${(p.unitAmount / 100).toFixed(0)}</div>
                <button
                  data-sku={p.sku}
                  className="bc-buy-btn"
                  style={{
                    background: "#0a0a0f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#888", marginTop: 28, lineHeight: 1.6 }}>
        Parts are sourced through verified distribution channels. Need a part not listed? Email
        blackcat@blackcatrobotics.com and we&apos;ll source it.
      </p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('.bc-buy-btn').forEach(function(btn){
              btn.addEventListener('click', function(){
                var sku = btn.getAttribute('data-sku');
                btn.textContent = 'Redirecting…';
                btn.disabled = true;
                fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sku: sku, quantity: 1 })
                }).then(function(r){ return r.json(); }).then(function(d){
                  if (d.ok && d.url) { window.location.href = d.url; }
                  else { alert('Checkout unavailable: ' + (d.error || 'unknown error')); btn.textContent = 'Buy'; btn.disabled = false; }
                }).catch(function(){
                  alert('Checkout request failed.'); btn.textContent = 'Buy'; btn.disabled = false;
                });
              });
            });
          `,
        }}
      />
    </main>
  );
}
