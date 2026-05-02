import { createFileRoute } from "@tanstack/react-router";
import { SlideDeck } from "@/components/slides/SlideDeck";
import { TitleSlide } from "@/components/slides/TitleSlide";
import { ProblemSlide } from "@/components/slides/ProblemSlide";
import { SolutionSlide } from "@/components/slides/SolutionSlide";
import { CompetitionSlide } from "@/components/slides/CompetitionSlide";
import { StorySlide } from "@/components/slides/StorySlide";
import { PipelineSlide } from "@/components/slides/PipelineSlide";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "London Reporting House — Investor Presentation" },
      { name: "description", content: "LRH is building the data layer for global repo markets. Investor presentation, May 2026." },
      { property: "og:title", content: "London Reporting House — Investor Presentation" },
      { property: "og:description", content: "The data layer for global repo markets." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SlideDeck
      slides={[
        { id: "title", node: <TitleSlide /> },
        { id: "problem", node: <ProblemSlide /> },
        { id: "solution", node: <SolutionSlide /> },
        { id: "competition", node: <CompetitionSlide /> },
        { id: "story", node: <StorySlide /> },
        { id: "pipeline", node: <PipelineSlide /> },
      ]}
    />
  );
}
