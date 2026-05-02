import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const fields = [
  "Cash amount",
  "Repo rate",
  "Tenor",
  "Collateral ISIN",
  "Haircut",
  "Counterparty",
  "Venue",
  "Maturity",
  "Clearing status",
  "+90 other fields",
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "The Thesis", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "SFTR is the missing golden source of repo data", x: PAD_X, y: 11, w: 70, h: 16 },
  { id: "body", kind: "region", regionId: "body", x: PAD_X, y: 32, w: 50, h: 56 },
  { id: "fields", kind: "region", regionId: "fields", x: 56, y: 32, w: 100 - PAD_X - 56, h: 56 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function ThesisSlide() {
  const regions = {
    body: (
      <div className="space-y-5 text-base md:text-lg leading-relaxed text-foreground/80 h-full">
        <p>
          Since 2020, SFTR has required UK and EU market participants to report{" "}
          <span className="font-medium text-foreground">every repo trade and transaction daily</span>.
        </p>
        <p>
          This creates a transaction-level dataset covering 90+ fields per trade across the
          entire European repo market.
        </p>
        <p className="border-l-2 border-[var(--lrh-blue)] pl-5 text-foreground">
          <span className="font-medium">LRH thesis:</span> SFTR is the missing golden source for
          repo — but its value is only unlocked when cleaned, normalised, anonymised and
          converted into market intelligence.
        </p>
      </div>
    ),
    fields: (
      <SlideCard variant="soft" className="h-full">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-4">
          Per-trade fields
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {fields.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-foreground/85">
              <span className="h-1 w-1 rounded-full bg-[var(--lrh-blue)] flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </SlideCard>
    ),
    footer: <SlideFooter page={2} />,
  };
  return <GenericSlide slideId="thesis" defaultBlocks={defaultBlocks} regions={regions} />;
}
