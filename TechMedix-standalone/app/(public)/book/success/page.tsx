import Link from "next/link";
import { getSessionById } from "@/lib/store/sessions-catalog";
import PlanUpsell from "../_components/PlanUpsell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking confirmed | BlackCat Robotics",
  robots: { index: false, follow: false },
};

const CAL = "https://cal.com/black-cat-orjpcq";

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; session_id?: string; email?: string }>;
}) {
  const { product, email } = await searchParams;
  const sess = product ? getSessionById(product) : undefined;
  const calLink = sess?.calLink || "black-cat-orjpcq/fullsession";

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "120px 20px 80px",
        textAlign: "center",
        fontFamily: "'Satoshi', 'Helvetica Neue', sans-serif",
        color: "#0a0a0f",
      }}
    >
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
      <h1 style={{ fontFamily: "'Tanker', sans-serif", fontSize: 34, marginBottom: 12 }}>
        You&apos;re booked — now pick a time
      </h1>
      <p style={{ color: "#3a3a45", fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 8px" }}>
        {sess ? (
          <>
            Payment for <strong>{sess.name}</strong> is confirmed. Schedule your {sess.durationLabel}{" "}
            session below — Cal.com handles reminders.
          </>
        ) : (
          <>Payment confirmed. Schedule your session below.</>
        )}
      </p>
      <p style={{ color: "#8888a0", fontSize: 13, marginBottom: 28 }}>
        A receipt is on its way to your email.
      </p>

      <div
        style={{
          border: "1px solid rgba(10,10,15,0.1)",
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 720,
        }}
      >
        <iframe
          src={`${CAL}/${calLink}`}
          style={{ width: "100%", height: 720, border: 0 }}
          title="Schedule your session"
        />
      </div>

      <PlanUpsell email={email} />

      <p style={{ marginTop: 28 }}>
        <Link href="/book" style={{ color: "#cc3d17", marginRight: 16 }}>
          Back to booking
        </Link>
        <Link href="/" style={{ color: "#0a0a0f" }}>
          Back to home
        </Link>
      </p>
    </main>
  );
}
