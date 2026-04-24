type ProgressBarProps = {
  value: number;       // 0–100
  total?: number;      // raw numerator, shown in label
  max?: number;        // raw denominator, shown in label
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function ProgressBar({
  value,
  total,
  max,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const h = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="w-full">
      <div className={`w-full ${h} rounded-full bg-theme-5 overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            background:
              clamped === 100
                ? "#1db87a"
                : "linear-gradient(90deg, #e8601e 0%, #f28c5e 100%)",
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex justify-between font-ui text-[0.6rem] uppercase tracking-widest text-theme-30">
          <span>
            {total !== undefined && max !== undefined
              ? `${total} / ${max}`
              : `${clamped}%`}
          </span>
          {clamped === 100 && (
            <span style={{ color: "#1db87a" }}>Complete</span>
          )}
        </div>
      )}
    </div>
  );
}
