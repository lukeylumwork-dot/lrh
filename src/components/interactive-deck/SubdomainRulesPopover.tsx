import { useState, type KeyboardEvent } from "react";
import { Settings2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_RULES,
  useSubdomainStripRules,
  type SubdomainStripRules,
} from "@/lib/subdomainStripRules";

interface Props {
  deckId: string;
}

export function SubdomainRulesPopover({ deckId }: Props) {
  const [rules, save] = useSubdomainStripRules(deckId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" title="URL subdomain rules">
          <Settings2 className="mr-2 h-4 w-4" />
          URL rules
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Subdomain strip rules</h4>
            <p className="text-xs text-muted-foreground">
              Controls how URLs are shortened in hover previews. Allowlist wins
              over denylist.
            </p>
          </div>

          <ChipsField
            label="Strip (denylist)"
            placeholder="e.g. www, m, amp"
            values={rules.deny}
            onChange={(deny) => save({ ...rules, deny })}
          />
          <ChipsField
            label="Keep (allowlist)"
            placeholder="e.g. en, fr-ca"
            values={rules.allow}
            onChange={(allow) => save({ ...rules, allow })}
          />

          <div className="flex justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => save({ ...DEFAULT_RULES })}
            >
              Reset to defaults
            </Button>
            <p className="self-center text-[11px] text-muted-foreground">
              Saved to this deck on this device
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ChipsField({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: SubdomainStripRules["deny"];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tokens = draft
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9-]+$/.test(s));
    if (tokens.length === 0) {
      setDraft("");
      return;
    }
    const next = Array.from(new Set([...values, ...tokens]));
    onChange(next);
    setDraft("");
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1.5 rounded-md border bg-background p-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${v}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : ""}
          className="h-6 min-w-[100px] flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
