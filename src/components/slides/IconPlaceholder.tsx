import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconPlaceholderProps {
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outline";
  className?: string;
}

export function IconPlaceholder({
  icon: Icon,
  size = "md",
  variant = "filled",
  className,
}: IconPlaceholderProps) {
  const sizeMap = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };
  const iconSizeMap = { sm: 18, md: 24, lg: 32 };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md shrink-0",
        sizeMap[size],
        variant === "filled" && "bg-[var(--lrh-blue)] text-white",
        variant === "outline" && "border border-[var(--lrh-blue)] text-[var(--lrh-blue)]",
        className,
      )}
    >
      {Icon ? <Icon size={iconSizeMap[size]} strokeWidth={1.75} /> : null}
    </div>
  );
}
