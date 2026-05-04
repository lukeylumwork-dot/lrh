import { Button } from "@/components/ui/button";

interface Props {
  variants: string[];
  current: string;
  onChange: (variant: string) => void;
}

export function VariantToggle({ variants, current, onChange }: Props) {
  if (variants.length <= 1) return null;
  return (
    <div className="flex items-center gap-1 rounded-md border bg-card p-1">
      {variants.map((v) => (
        <Button
          key={v}
          size="sm"
          variant={v === current ? "default" : "ghost"}
          onClick={() => onChange(v)}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}
