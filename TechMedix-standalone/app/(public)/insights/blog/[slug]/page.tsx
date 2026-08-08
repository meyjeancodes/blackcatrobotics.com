import Link from "next/link";
import { notFound } from "next/navigation";
import { INSIGHT_POSTS, getPostBySlug } from "@/lib/content/insight-posts";
import InsightCTA from "../../_components/InsightCTA";
import ALL_PLATFORMS from "@/lib/platforms";

export function generateStaticParams() {
  return INSIGHT_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `https://blackcatrobotics.com/insights/blog/${post.slug}`;
  return {
    title: `${post.title} | TechMedix Insights`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      siteName: "BlackCat Robotics",
      images: [{ url: "/og-techmedix.png", width: 1200, height: 630 }],
    },
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = post.platformId
    ? (ALL_PLATFORMS as any[]).find((x) => x.id === post.platformId)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    mainEntityOfPage: `https://blackcatrobotics.com/insights/blog/${post.slug}`,
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/insights/blog"
        className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 hover:text-theme-fire"
      >
        ← All insights
      </Link>

      <article>
        <div className="font-ui text-[0.6rem] uppercase tracking-[0.16em] text-theme-fire">
          {post.category} · {post.readMins} min read
        </div>
        <h1 className="mt-2 font-header text-4xl leading-tight tracking-[-0.03em] text-theme-primary lg:text-5xl">
          {post.title}
        </h1>
        <p className="mt-2 font-ui text-[0.62rem] uppercase tracking-[0.12em] text-theme-40">
          {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.author}
        </p>
        <div className="mt-6 space-y-4">
          {post.body.map((para, i) => (
            <p key={i} className="max-w-2xl text-[15px] leading-7 text-theme-52">
              {para}
            </p>
          ))}
        </div>
      </article>

      {related && (
        <Link
          href={`/insights/${related.id}`}
          className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-70 transition hover:bg-white"
        >
          See {related.name} failure modes →
        </Link>
      )}

      <InsightCTA platformName={related?.name} platformId={related?.id} />
    </div>
  );
}
