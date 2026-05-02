import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const steps = [
  { n: "01", title: "Authorization Form", body: "Client signs the form. This permits the Trade Repository to share SFTR data with LRH." },
  { n: "02", title: "SFTP Connectivity Form", body: "Client signs the form. This allows LRH to pull SFTR data via SFTP." },
  { n: "03", title: "Subscription Agreement", body: "Client signs the agreement, formalizing their engagement with LRH." },
  { n: "04", title: "Account & UI Access", body: "LRH creates the client account and provides login access to the User Interface." },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Client Onboarding Process", x: PAD_X, y: 6, w: 50, h: 3 },
  { id: "title", kind: "title", text: "Client Onboarding", x: PAD_X, y: 11, w: 70, h: 10 },
  {
    id: "body",
    kind: "text",
    text: "No engineering resources or technical integrations required from the banks to onboard.",
    x: PAD_X,
    y: 22,
    w: 70,
    h: 6,
  },
  { id: "steps", kind: "region", regionId: "steps", x: PAD_X, y: 33, w: 100 - 2 * PAD_X, h: 55 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function OnboardingSlide() {
  const regions = {
    steps: (
      <div className="h-full grid grid-cols-4 gap-4">
        {steps.map((s) => (
          <SlideCard key={s.n} className="flex flex-col">
            <div className="font-heading font-bold text-5xl text-[var(--lrh-blue)]/30 leading-none mb-4">
              {s.n}
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--lrh-blue)] font-medium mb-2">
              Step {s.n}
            </div>
            <h3 className="font-heading font-bold text-base mb-3">{s.title}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">{s.body}</p>
          </SlideCard>
        ))}
      </div>
    ),
    footer: <SlideFooter page={9} />,
  };
  return <GenericSlide slideId="onboarding" defaultBlocks={defaultBlocks} regions={regions} />;
}
