import { ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { textStyles } from "./brand";
import { Highlighted } from "./Highlighted";

/** Apply <Highlighted> to plain string children; pass through anything else. */
function highlightChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") return <Highlighted>{child}</Highlighted>;
    if (typeof child === "number") return child;
    if (isValidElement(child)) return child;
    return child;
  });
}

interface SlideLayoutProps {
  children: ReactNode;
  /** Use the deep-navy section style (white-on-navy). */
  dark?: boolean;
  /** Disable the institutional padding (e.g. for full-bleed editor canvases). */
  bleed?: boolean;
  className?: string;
}

export function SlideLayout({
  children,
  dark = false,
  bleed = false,
  className,
}: SlideLayoutProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col",
        !bleed &&
          "px-[var(--lrh-slide-padding-x)] py-[var(--lrh-slide-padding-y)]",
        dark
          ? "bg-[var(--lrh-navy-900)] text-white"
          : "bg-[var(--lrh-surface-100)] text-[var(--lrh-navy-700)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SlideTitleProps {
  children: ReactNode;
  /** A keyword colored brand-blue, appended/prepended to the title. */
  highlight?: string;
  highlightPosition?: "before" | "after";
  /** Step down to h2 if you need a smaller title (e.g. continued slide). */
  size?: "h1" | "h2";
  className?: string;
}

export function SlideTitle({
  children,
  highlight,
  highlightPosition = "after",
  size = "h1",
  className,
}: SlideTitleProps) {
  return (
    <h1 className={cn(size === "h1" ? textStyles.h1 : textStyles.h2, className)}>
      {highlightPosition === "before" && highlight && (
        <span className="text-[var(--lrh-blue-500)]">{highlight} </span>
      )}
      {highlightChildren(children)}
      {highlightPosition === "after" && highlight && (
        <span className="text-[var(--lrh-blue-500)]"> {highlight}</span>
      )}
    </h1>
  );
}

interface SlideBodyProps {
  children: ReactNode;
  muted?: boolean;
  className?: string;
}

export function SlideBody({ children, muted = false, className }: SlideBodyProps) {
  return (
    <p
      className={cn(
        muted ? textStyles.bodyMuted : textStyles.bodyLg,
        "max-w-4xl",
        className,
      )}
    >
      {highlightChildren(children)}
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
        "pt-[var(--lrh-space-5)] mt-[var(--lrh-space-5)] border-t border-[var(--lrh-surface-300)]",
        "flex justify-between items-center",
        textStyles.caption,
        "uppercase tracking-[0.16em] text-[var(--lrh-navy-500)]",
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
    <div className={cn(textStyles.eyebrow, "mb-[var(--lrh-space-3)]", className)}>
      {children}
    </div>
  );
}
