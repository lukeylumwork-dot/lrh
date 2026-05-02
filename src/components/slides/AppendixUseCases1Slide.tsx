import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
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

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Appendix · Use Cases", x: PAD_X, y: 6, w: 50, h: 3 },
  { id: "title", kind: "title", text: "Stakeholder Use Cases", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "table", kind: "region", regionId: "table", x: PAD_X, y: 28, w: 60, h: 60 },
  { id: "side", kind: "region", regionId: "side", x: 70, y: 28, w: 100 - PAD_X - 70, h: 60 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function AppendixUseCases1Slide() {
  const regions = {
    table: (
      <SlideCard className="overflow-hidden p-0 h-full">
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
    ),
    side: (
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
    ),
    footer: <SlideFooter page={16} />,
  };
  return <GenericSlide slideId="appendixUseCases1" defaultBlocks={defaultBlocks} regions={regions} />;
}
