import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "soft" | "outline";
  className?: string;
}

export function SlideCard({ children, variant = "default", className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md p-6",
        variant === "default" && "bg-card border border-border",
        variant === "soft" && "bg-[var(--lrh-soft-blue)]/40 border border-[var(--lrh-soft-blue)]",
        variant === "outline" && "border border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
