import { SlideLayout, SlideTitle, SlideBody, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const steps = [
  {
    n: "01",
    title: "Authorization Form",
    body: "Client signs the form. This permits the Trade Repository to share SFTR data with LRH.",
  },
  {
    n: "02",
    title: "SFTP Connectivity Form",
    body: "Client signs the form. This allows LRH to pull SFTR data via SFTP.",
  },
  {
    n: "03",
    title: "Subscription Agreement",
    body: "Client signs the agreement, formalizing their engagement with LRH.",
  },
  {
    n: "04",
    title: "Account & UI Access",
    body: "LRH creates the client account and provides login access to the User Interface.",
  },
];

export function OnboardingSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Client Onboarding Process</SlideEyebrow>
      <div className="space-y-3 mb-10">
        <SlideTitle highlight="Onboarding" highlightPosition="after">Client</SlideTitle>
        <SlideBody>
          No engineering resources or technical integrations required from the banks to onboard.
        </SlideBody>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
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

      <SlideFooter page={9} />
    </SlideLayout>
  );
}
