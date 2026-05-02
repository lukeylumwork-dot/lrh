import { SlideLayout, SlideTitle, SlideBody, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { ShieldCheck, Lightbulb, Briefcase, BarChart3, Users } from "lucide-react";
import { IconPlaceholder } from "./IconPlaceholder";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Risk-Free Evaluation",
    body: "Banks assess LRH's analytics capabilities without exposing live or sensitive data.",
  },
  {
    icon: Lightbulb,
    title: "Influence on Roadmap",
    body: "Pilot feedback directly shapes future enhancements to the LRH platform.",
  },
  {
    icon: Briefcase,
    title: "Minimal IT & Legal",
    body: "Designed to bypass heavy integration, procurement, and compliance hurdles.",
  },
  {
    icon: BarChart3,
    title: "High Volume",
    body: "View own data aggregated with SFTR data from other systemically important banks first.",
  },
  {
    icon: Users,
    title: "Cross-Desk Utility",
    body: "Accessible to front, middle, back office and risk teams for broad internal engagement.",
  },
];

const confirmed = ["UBS", "BBVA", "Citi", "J.P. Morgan"];
const awaiting = ["HSBC", "Barclays", "Santander", "BofA Merrill Lynch", "BNP Paribas", "RBC Capital Markets"];

export function SandboxPilotSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>Sandbox Pilot</SlideEyebrow>
      <div className="space-y-3 mb-7">
        <SlideTitle highlight="Pilot" highlightPosition="after">Sandbox</SlideTitle>
        <SlideBody>
          A strategic initiative offering systemically important banks a low-risk, non-production
          environment to evaluate LRH's SFTR-based repo analytics. Participating banks share a
          fixed, anonymised set of historic SFTR data — ingested into an isolated environment.
        </SlideBody>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 mb-3">
            Benefits to Participating Banks
          </div>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b) => (
              <SlideCard key={b.title} className="flex gap-3 items-start py-4">
                <IconPlaceholder icon={b.icon} size="sm" />
                <div>
                  <div className="font-heading font-bold text-sm mb-1">{b.title}</div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{b.body}</p>
                </div>
              </SlideCard>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <SlideCard variant="soft" className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-medium mb-3">
              Confirmed
            </div>
            <ul className="space-y-2">
              {confirmed.map((c) => (
                <li key={c} className="text-sm font-medium text-foreground">{c}</li>
              ))}
            </ul>
          </SlideCard>
          <SlideCard className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/55 font-medium mb-3">
              Awaiting Confirmation
            </div>
            <ul className="space-y-1.5">
              {awaiting.map((c) => (
                <li key={c} className="text-sm text-foreground/75">{c}</li>
              ))}
            </ul>
          </SlideCard>
        </div>
      </div>

      <SlideFooter page={8} />
    </SlideLayout>
  );
}
