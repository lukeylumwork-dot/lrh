import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { IconPlaceholder } from "./IconPlaceholder";
import { Users, TrendingDown, Handshake, PoundSterling, CalendarCheck, Route } from "lucide-react";

const metrics = [
  { icon: Users, label: "Headcount", value: "9", sub: "Full-time employees" },
  { icon: TrendingDown, label: "Current Burn Rate", value: "£85k", sub: "/ month" },
  { icon: Handshake, label: "Client Forecast", value: "12", sub: "Fee-paying clients in Q4 2026" },
  { icon: PoundSterling, label: "Investment Ask", value: "£1.5m", sub: "", highlight: true },
  { icon: CalendarCheck, label: "EBITDA Breakeven", value: "Q4 '26", sub: "" },
  { icon: Route, label: "Use of Funds", value: "18 mo", sub: "Runway to deliver roadmap & critical mass" },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Investment Ask", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Investment Ask", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "metrics", kind: "region", regionId: "metrics", x: PAD_X, y: 30, w: 100 - 2 * PAD_X, h: 58 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function InvestmentAskSlide() {
  const regions = {
    metrics: (
      <div className="h-full grid grid-cols-3 gap-5">
        {metrics.map((m) => (
          <SlideCard
            key={m.label}
            variant={m.highlight ? "soft" : "default"}
            className="flex flex-col items-center text-center justify-center"
          >
            <IconPlaceholder
              icon={m.icon}
              size="md"
              variant={m.highlight ? "filled" : "outline"}
              className="mb-4"
            />
            <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 font-medium mb-2">
              {m.label}
            </div>
            <div className="font-heading font-bold text-4xl md:text-5xl text-[var(--lrh-deep-navy)] mb-1">
              {m.value}
            </div>
            {m.sub && <div className="text-xs text-foreground/65 mt-1 max-w-[18rem]">{m.sub}</div>}
          </SlideCard>
        ))}
      </div>
    ),
    footer: <SlideFooter page={11} />,
  };
  return <GenericSlide slideId="investmentAsk" defaultBlocks={defaultBlocks} regions={regions} />;
}
