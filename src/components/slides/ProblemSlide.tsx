import { SlideLayout, SlideTitle, SlideBody } from "@/components/slides/SlideLayout";
import { SlideCard } from "@/components/slides/Card";
import { IconPlaceholder } from "@/components/slides/IconPlaceholder";
import { Hourglass, EyeOff, Coins, Settings } from "lucide-react";

const issues = [
  { icon: Hourglass, title: "Sparse & delayed data", body: "Existing sources offer only high-level metrics, often delayed and incomplete." },
  { icon: EyeOff, title: "Limited transparency", body: "No single, detailed golden source aggregates real transactions across venues." },
  { icon: Coins, title: "High cost", body: "Available data is expensive, fragmented, and rarely actionable." },
  { icon: Settings, title: "Lower market efficiency", body: "Opacity reduces trading efficiency and impedes risk management and compliance." },
];

export function ProblemSlide() {
  return (
    <SlideLayout>
      <div className="space-y-4 mb-10">
        <SlideTitle highlight="Problem" highlightPosition="before">: There is no market in repo data</SlideTitle>
        <SlideBody>
          The repo market is highly opaque and fragmented, lacking a unified, timely, or detailed data source.
        </SlideBody>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        {issues.map(({ icon, title, body }) => (
          <SlideCard key={title} className="flex gap-5 items-start">
            <IconPlaceholder icon={icon} size="md" />
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-xl">{title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{body}</p>
            </div>
          </SlideCard>
        ))}
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-between text-xs text-foreground/50">
        <span>© London Reporting House 2026 · Private &amp; Confidential</span>
        <span>2 / 6</span>
      </div>
    </SlideLayout>
  );
}
