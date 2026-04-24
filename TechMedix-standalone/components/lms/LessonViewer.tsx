import type { LessonDetail } from "@/lib/techmedix/lms";
import { MarkCompleteButton } from "./MarkCompleteButton";

function TextBlock({ content }: { content: Record<string, unknown> }) {
  const text = String(content.text ?? "");
  const paragraphs = text.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-theme-75 text-sm leading-7">
          {para}
        </p>
      ))}
    </div>
  );
}

function CodeBlock({ content }: { content: Record<string, unknown> }) {
  const code = String(content.code ?? "");
  const label = content.label ? String(content.label) : null;

  return (
    <div className="rounded-xl overflow-hidden border border-theme-10">
      {label && (
        <div className="px-4 py-2 bg-theme-2 border-b border-theme-10">
          <span className="font-ui text-[0.62rem] uppercase tracking-widest text-theme-35">
            {label}
          </span>
        </div>
      )}
      <pre
        className="px-5 py-4 overflow-x-auto text-xs leading-6 text-theme-70"
        style={{
          background: "var(--surface)",
          fontFamily: "'Chakra Petch', monospace",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ImageBlock({ content }: { content: Record<string, unknown> }) {
  const url = String(content.url ?? "");
  const alt = content.alt ? String(content.alt) : "Lesson image";
  const caption = content.caption ? String(content.caption) : null;

  if (!url) return null;

  return (
    <figure className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="w-full rounded-xl border border-theme-10 object-cover"
      />
      {caption && (
        <figcaption className="text-center text-xs text-theme-35 font-ui uppercase tracking-widest">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ content }: { content: Record<string, unknown> }) {
  const url = String(content.url ?? "");
  const isEmbed =
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com");

  if (!url) return null;

  if (isEmbed) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border border-theme-10">
        <iframe
          src={url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Lesson video"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-theme-10">
      <video
        src={url}
        controls
        className="w-full"
        style={{ background: "var(--surface)" }}
      />
    </div>
  );
}

export function LessonViewer({
  lesson,
  userId,
}: {
  lesson: LessonDetail;
  userId: string;
}) {
  const isComplete = lesson.progress?.status === "completed";

  return (
    <div className="space-y-8">
      {/* Content blocks */}
      <div className="space-y-6">
        {lesson.content_blocks.map((block) => {
          switch (block.content_type) {
            case "text":
              return <TextBlock key={block.id} content={block.content} />;
            case "code":
              return <CodeBlock key={block.id} content={block.content} />;
            case "image":
              return <ImageBlock key={block.id} content={block.content} />;
            case "video":
              return <VideoBlock key={block.id} content={block.content} />;
            default:
              return null;
          }
        })}
      </div>

      {/* Completion action */}
      <div className="pt-6 border-t border-theme-5">
        <MarkCompleteButton
          lessonId={lesson.id}
          moduleId={lesson.module_id}
          userId={userId}
          isComplete={isComplete}
        />
      </div>
    </div>
  );
}
