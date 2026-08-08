import Link from "next/link";
import { INSIGHT_POSTS } from "@/lib/content/insight-posts";
import InsightCTA from "../_components/InsightCTA";

export const metadata = {
  title: "TechMedix Insights — Predictive Maintenance Guides | BlackCat Robotics",
  description:
    "Field guides and deep dives on predictive maintenance for autonomous robots: failure modes, MTBF, and the 48-hour prediction window.",
  alternates: { canonical: "https://blackcatrobotics.com/insights/blog" },
  openGraph: {
    title: "TechMedix Insights — Predictive Maintenance Guides",
    description:
      "Field guides on failure modes, MTBF, and predictive maintenance for autonomous robot fleets.",
    url: "https://blackcatrobotics.com/insights/blog",
    siteName: "BlackCat Robotics",
    images: [{ url: "/og-techmedix.png", width: 1200, height: 630 }],
  },
};

export default function InsightBlogIndex() {
  const posts = [...INSIGHT_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="space-y-10">
      <Link
        href="/insights"
        className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 hover:text-theme-fire"
      >
        ← All platforms
      </Link>
      <div>
        <p className="kicker">TechMedix Insights</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Field guides &amp; deep dives
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Practical writing on predictive maintenance for autonomous fleets — what the failure data
          actually says, and how to act on it before downtime.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/insights/blog/${post.slug}`}
            className="group rounded-2xl border border-theme-12 bg-white p-5 transition hover:border-theme-fire"
          >
            <div className="font-ui text-[0.6rem] uppercase tracking-[0.16em] text-theme-fire">
              {post.category} · {post.readMins} min
            </div>
            <div className="mt-2 font-header text-xl tracking-[-0.02em] text-theme-primary">
              {post.title}
            </div>
            <p className="mt-2 line-clamp-3 text-sm leading-5 text-theme-52">{post.excerpt}</p>
            <div className="mt-3 font-ui text-[0.58rem] uppercase tracking-[0.12em] text-theme-40">
              {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} →
            </div>
          </Link>
        ))}
      </div>

      <InsightCTA />
    </div>
  );
}
