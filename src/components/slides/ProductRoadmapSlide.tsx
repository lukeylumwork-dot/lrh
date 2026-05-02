import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { SlideCard } from "./Card";

const tracks = [
  { name: "Peer Benchmarking", body: "Clients assess their own repo trading activity against LRH's aggregated market view, enabling better pricing, negotiation and risk decisions." },
  { name: "Securities Lending", body: "Natural sister product to repo. Analyse lending fees, borrow demand, collateral usage and market trends — frequently requested by banks." },
  { name: "Intraday Repo Data", body: "Move from T+1 to intraday — most global banks report within two hours. Transformational for trading, pricing and liquidity decisions." },
  { name: "Total Return Swaps", body: "Adjacent to repo. Leverage existing client relationships, ingestion pipelines and legal frameworks to ingest EMIR and MiFID data." },
  { name: "Benchmarks & Indices", body: "Repo lacks trusted independent benchmarks. Establish standardised reference rates and indices from proprietary data — methodology already underway." },
  { name: "International Expansion", body: "Extend the give-to-get model beyond SFTR by ingesting US regulatory data: MMSR, SSMD, OFR and SLATE." },
  { name: "Market Data Sales", body: "Sell market data directly or through partners (LSEG, CME, ICE) to potentially thousands of non-contributing clients." },
];

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Product Roadmap", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "Product Roadmap", x: PAD_X, y: 11, w: 70, h: 10 },
  { id: "tracks", kind: "region", regionId: "tracks", x: PAD_X, y: 30, w: 100 - 2 * PAD_X, h: 58 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function ProductRoadmapSlide() {
  const regions = {
    tracks: (
      <div className="h-full grid grid-cols-7 gap-3">
        {tracks.map((t, i) => (
          <SlideCard key={t.name} className="flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--lrh-blue)] font-bold mb-3">
              0{i + 1}
            </div>
            <h3 className="font-heading font-bold text-sm leading-tight mb-3 pb-3 border-b border-border min-h-[3rem]">
              {t.name}
            </h3>
            <p className="text-xs text-foreground/75 leading-relaxed">{t.body}</p>
          </SlideCard>
        ))}
      </div>
    ),
    footer: <SlideFooter page={12} />,
  };
  return <GenericSlide slideId="productRoadmap" defaultBlocks={defaultBlocks} regions={regions} />;
}
