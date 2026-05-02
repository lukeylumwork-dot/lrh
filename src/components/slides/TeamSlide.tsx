import { SlideLayout, SlideTitle, SlideEyebrow, SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";
import { assets } from "./assets";

const team = [
  { img: assets.team.danny, name: "Danny Corrigan", role: "CEO & Co-founder", bio: "35+ yrs in wholesale market derivatives. CEO of CME European Trade Repository. Led teams at ICAP, ING, NatWest." },
  { img: assets.team.ben, name: "Ben Corrigan", role: "COO & Co-founder", bio: "Experienced start-up founder. Sold previous venture 'Pouch' to DailyMail. Head of Intl. Sales at Sterling Trading Tech." },
  { img: assets.team.robbie, name: "Robbie Thandi", role: "CTO", bio: "Software Engineer at Theodo, AppFox, and IBM." },
  { img: assets.team.luke, name: "Dr Luke Johnson", role: "Head of Data & Analytics", bio: "Astrophysicist, Imperial College London." },
  { img: assets.team.justin, name: "Justin", role: "Head of Sales", bio: "17+ yrs at Barclays Investment Bank. Director of Fixed Income Financing & Money Market Sales." },
  { img: assets.team.marian, name: "Dr Marian Priebe", role: "Quantitative Analyst", bio: "Geneticist at Queen Mary University London and Cambridge University." },
  { img: assets.team.max, name: "Max Braddock", role: "Senior Data Engineer", bio: "Assistant VP — Programme Data Lead at Barclays." },
  { img: assets.team.mo, name: "Mo Eldosoky", role: "Fullstack Engineer", bio: "Software Engineer at Savills (3+ yrs) and Rockborne." },
  { img: assets.team.agam, name: "Agam Mohal", role: "Junior Quantitative Analyst", bio: "Graduate with Capital Markets experience." },
];

export function TeamSlide() {
  return (
    <SlideLayout>
      <SlideEyebrow>The Team</SlideEyebrow>
      <SlideTitle highlight="Team" highlightPosition="after" className="mb-8">
        The
      </SlideTitle>

      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {team.map((m) => (
          <SlideCard key={m.name} className="flex gap-4 items-start py-4">
            <img
              src={m.img}
              alt={m.name}
              className="h-14 w-14 rounded-full object-cover flex-shrink-0 border border-border"
            />
            <div className="min-w-0 flex-1">
              <div className="font-heading font-bold text-sm leading-tight">{m.name}</div>
              <div className="text-[11px] text-[var(--lrh-blue)] font-medium uppercase tracking-wide mb-1.5">
                {m.role}
              </div>
              <p className="text-[11px] text-foreground/70 leading-snug line-clamp-3">{m.bio}</p>
            </div>
          </SlideCard>
        ))}
      </div>

      <SlideFooter page={13} />
    </SlideLayout>
  );
}
