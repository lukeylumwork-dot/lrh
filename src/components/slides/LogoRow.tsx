import { cn } from "@/lib/utils";

interface LogoRowProps {
  logos: string[];
  className?: string;
}

/** Placeholder logo row — neutral text marks until real assets are provided. */
export function LogoRow({ logos, className }: LogoRowProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-8",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${logos.length}, minmax(0, 1fr))` }}
    >
      {logos.map((name) => (
        <div
          key={name}
          className="flex items-center justify-center h-12 text-foreground/50 font-heading font-bold text-lg tracking-wider uppercase"
        >
          {name}
        </div>
      ))}
    </div>
  );
}
