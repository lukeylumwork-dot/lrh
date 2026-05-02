import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SlideLayoutProps {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}

export function SlideLayout({ children, dark = false, className }: SlideLayoutProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col",
        "px-16 py-14 md:px-24 md:py-16",
        dark ? "bg-[var(--lrh-deep-navy)] text-white" : "bg-background text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SlideTitleProps {
  children: ReactNode;
  highlight?: string;
  highlightPosition?: "before" | "after";
  className?: string;
}

/**
 * SlideTitle: renders title with one keyword highlighted in blue.
 * Pass highlight as the keyword and the rest as children.
 */
export function SlideTitle({
  children,
  highlight,
  highlightPosition = "after",
  className,
}: SlideTitleProps) {
  return (
    <h1
      className={cn(
        "font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]",
        className,
      )}
    >
      {highlightPosition === "before" && highlight && (
        <span className="text-[var(--lrh-blue)]">{highlight} </span>
      )}
      {children}
      {highlightPosition === "after" && highlight && (
        <span className="text-[var(--lrh-blue)]"> {highlight}</span>
      )}
    </h1>
  );
}

interface SlideBodyProps {
  children: ReactNode;
  className?: string;
}

export function SlideBody({ children, className }: SlideBodyProps) {
  return (
    <p className={cn("text-lg md:text-xl leading-relaxed max-w-4xl text-foreground/80", className)}>
      {children}
    </p>
  );
}
