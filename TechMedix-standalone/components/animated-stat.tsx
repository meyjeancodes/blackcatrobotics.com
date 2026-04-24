"use client";

import { useEffect, useRef, useState } from "react";

function splitDigits(value: number | string): string[] {
  return String(value).split("");
}

interface AnimatedStatProps {
  value: number | string;
  className?: string;
  delay?: number;
}

export function AnimatedStat({ value, className = "", delay = 0 }: AnimatedStatProps) {
  const [animating, setAnimating] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const digits = splitDigits(value);

  return (
    <span ref={ref} className={`t-digit-group ${animating ? "is-animating" : ""} ${className}`}>
      {digits.map((d, i) => (
        <span key={i} className="t-digit" data-stagger={i}>
          {d}
        </span>
      ))}
    </span>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className = "", delay = 0 }: StaggerContainerProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`t-stagger ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
