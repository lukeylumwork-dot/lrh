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
        "px-12 py-10 md:px-20 md:py-14",
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

export function SlideTitle({
  children,
  highlight,
  highlightPosition = "after",
  className,
}: SlideTitleProps) {
  return (
    <h1
      className={cn(
        "font-heading text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]",
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
    <p className={cn("text-base md:text-lg leading-relaxed max-w-4xl text-foreground/75", className)}>
      {children}
    </p>
  );
}

interface SlideFooterProps {
  page: number;
  total?: number;
  className?: string;
}

export function SlideFooter({ page, total = 19, className }: SlideFooterProps) {
  return (
    <div
      className={cn(
        "pt-5 mt-5 border-t border-border/60 flex justify-between items-center text-[11px] uppercase tracking-[0.16em] text-foreground/45",
        className,
      )}
    >
      <span>© London Reporting House 2026 · Private &amp; Confidential</span>
      <span>{page} / {total}</span>
    </div>
  );
}

interface SlideEyebrowProps {
  children: ReactNode;
  className?: string;
}

export function SlideEyebrow({ children, className }: SlideEyebrowProps) {
  return (
    <div
      className={cn(
        "text-[11px] uppercase tracking-[0.22em] text-[var(--lrh-blue)] font-medium mb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
