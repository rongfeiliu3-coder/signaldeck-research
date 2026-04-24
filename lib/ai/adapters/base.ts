export type AiAdapterMode = "mock" | "live" | "disabled";

export type OpportunityAiInput = {
  topic: string;
  structuredEvidence: string[];
  counterEvidence: string[];
  opportunityTitles: string[];
};

export interface ResearchAiAdapter {
  readonly id: string;
  readonly label: string;
  readonly mode: AiAdapterMode;
  isAvailable(): boolean;
  summarizeOpportunityLab(input: OpportunityAiInput): Promise<{
    overview: string;
    watchlistNote: string;
    counterArgument: string;
  }>;
}
