import { useRef, useState, type KeyboardEvent } from "react";
import { Download, Settings2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_RULES,
  parseRulesPayload,
  serializeRules,
  useSubdomainStripRules,
  type SubdomainStripRules,
} from "@/lib/subdomainStripRules";

interface Props {
  deckId: string;
}

export function SubdomainRulesPopover({ deckId }: Props) {
  const [rules, save] = useSubdomainStripRules(deckId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    const json = serializeRules(rules);
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(json);
        toast.success("Rules copied");
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      try {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subdomain-rules-${deckId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Rules downloaded");
      } catch {
        toast.error("Could not export rules");
      }
    }
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = parseRulesPayload(text);
      if (!parsed) {
        setImportError("Invalid file: not a subdomain-strip-rules payload.");
        return;
      }
      save(parsed);
      toast.success("Rules imported");
    } catch {
      setImportError("Could not read file.");
    }
  };

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

          {importError && (
            <p className="text-xs text-destructive">{importError}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => save({ ...DEFAULT_RULES })}
              >
                Reset
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="mr-1 h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1 h-3.5 w-3.5" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImportFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Per deck · this device
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
