import { GenericSlide } from "./editor/GenericSlide";
import type { Block } from "./editor/types";
import { SlideFooter } from "./SlideLayout";
import { assets } from "./assets";

const PAD_X = 6.25;
const defaultBlocks: Block[] = [
  { id: "eyebrow", kind: "eyebrow", text: "Future Vision", x: PAD_X, y: 6, w: 40, h: 3 },
  { id: "title", kind: "title", text: "What is a repo all-to-all Trading Venue?", x: PAD_X, y: 11, w: 80, h: 14 },
  {
    id: "body",
    kind: "text",
    text: "One trusted data layer. Many clients. End-to-end impact across the trade lifecycle — execution, settlement, clearing and regulatory reporting.",
    x: PAD_X,
    y: 28,
    w: 70,
    h: 8,
  },
  { id: "diagram", kind: "region", regionId: "diagram", x: PAD_X, y: 40, w: 100 - 2 * PAD_X, h: 48 },
  { id: "footer", kind: "region", regionId: "footer", x: PAD_X, y: 92, w: 100 - 2 * PAD_X, h: 5 },
];

export function AllToAllSlide() {
  const regions = {
    diagram: (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={assets.allToAllDiagram}
          alt="LRH data layer ecosystem powering banks, hedge funds, asset managers, and money market funds via a repo all-to-all trading venue"
          className="max-h-full max-w-full object-contain rounded-md border border-border bg-card"
        />
      </div>
    ),
    footer: <SlideFooter page={19} />,
  };
  return <GenericSlide slideId="allToAll" defaultBlocks={defaultBlocks} regions={regions} />;
}
