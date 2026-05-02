import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
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

export function ThesisSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>The Thesis</SlideEyebrow>
      <SlideTitle highlight="golden source" highlightPosition="after" className="mb-8">
        SFTR is the missing
      </SlideTitle>
      <SlideTitle highlight="" className="mb-10 -mt-6">
        of repo data
      </SlideTitle>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <div className="lg:col-span-7 space-y-5 text-base md:text-lg leading-relaxed text-foreground/80">
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

        <div className="lg:col-span-5">
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
        </div>
      </div>

      <SlideFooter page={2} />
    </SlideLayout>
  );
}
