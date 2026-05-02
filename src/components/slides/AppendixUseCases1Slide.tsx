import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const products = ["GC Curves", "Specials", "Haircuts", "Flows", "ISIN Search", "Collateral Prices"];

const stakeholders: { name: string; useCases: boolean[] }[] = [
  { name: "Repo Trading Desk", useCases: [true, true, true, true, true, true] },
  { name: "Treasury / ALM", useCases: [true, false, true, true, false, true] },
  { name: "Market Risk", useCases: [true, true, true, false, true, true] },
  { name: "Credit Risk", useCases: [false, true, true, false, true, true] },
  { name: "Compliance / Reg.", useCases: [true, false, true, true, true, false] },
  { name: "Sales & Research", useCases: [true, true, false, true, true, true] },
];

const useCases = [
  "Market & Credit Risk Analysis",
  "Analysis of Funding & Liquidity",
  "Independent Price Verification (IPV) for mark-to-market of financing rates & collateral prices",
  "Inform strategy, commentary and research",
];

export function AppendixUseCases1Slide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Appendix · Use Cases</SlideEyebrow>
      <SlideTitle highlight="Use Cases" highlightPosition="after" className="mb-8">
        Stakeholder
      </SlideTitle>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-8">
          <SlideCard className="overflow-hidden p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--lrh-soft-blue)]/40 text-[var(--lrh-deep-navy)]">
                  <th className="text-left p-3 font-heading font-bold">Stakeholder</th>
                  {products.map((p) => (
                    <th key={p} className="p-3 font-heading font-bold text-center">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stakeholders.map((row, idx) => (
                  <tr key={row.name} className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <td className="p-3 font-medium text-foreground">{row.name}</td>
                    {row.useCases.map((v, i) => (
                      <td key={i} className="p-3 text-center">
                        {v ? (
                          <span className="inline-block h-2 w-2 rounded-full bg-[var(--lrh-blue)]" />
                        ) : (
                          <span className="inline-block h-2 w-2 rounded-full bg-foreground/15" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SlideCard>
        </div>

        <div className="lg:col-span-4">
          <SlideCard variant="soft" className="h-full">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-3">
              Cross-cutting use cases
            </div>
            <ul className="space-y-2.5">
              {useCases.map((u) => (
                <li key={u} className="flex gap-2 items-start text-sm text-foreground/80">
                  <span className="mt-2 h-1 w-1 rounded-full bg-[var(--lrh-blue)] flex-shrink-0" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </SlideCard>
        </div>
      </div>

      <SlideFooter page={16} />
    </SlideLayout>
  );
}
