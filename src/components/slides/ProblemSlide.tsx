import { SlideLayout, SlideTitle, SlideBody, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { IconPlaceholder } from "./IconPlaceholder";
import { Hourglass, EyeOff, PoundSterling, TrendingDown } from "lucide-react";

const items = [
  {
    icon: Hourglass,
    title: "Sparse & Delayed Data",
    body: "Existing sources offer only high-level metrics, such as weighted averages, and are often delayed.",
  },
  {
    icon: EyeOff,
    title: "Limited Transparency",
    body: "No single, detailed golden source aggregates real transaction data across venues and counterparties.",
  },
  {
    icon: PoundSterling,
    title: "High Cost",
    body: "Available data is often costly and incomplete.",
  },
  {
    icon: TrendingDown,
    title: "Lower Market Efficiency",
    body: "Lack of transparency reduces trading efficiency and impedes risk management and compliance.",
  },
];

export function ProblemSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>The Problem</SlideEyebrow>
      <div className="space-y-4 mb-8">
        <SlideTitle highlight="No Market" highlightPosition="before">in Repo Market Data</SlideTitle>
        <SlideBody>
          The repo market is highly opaque and fragmented, lacking a unified, timely, or detailed
          data source. Unlike exchange-traded markets, repo transactions occur across multiple
          venues and bilateral channels.
        </SlideBody>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
        {items.map((item) => (
          <SlideCard key={item.title} className="flex gap-5 items-start">
            <IconPlaceholder icon={item.icon} size="md" />
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{item.body}</p>
            </div>
          </SlideCard>
        ))}
      </div>

      <SlideFooter page={3} />
    </SlideLayout>
  );
}
