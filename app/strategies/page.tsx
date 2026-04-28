import { StrategyWorkbench } from "@/components/strategy-workbench";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function StrategiesPage() {
  const workspace = await getResearchWorkspace();

  return <StrategyWorkbench strategies={workspace.strategies} asOfDate={workspace.asOfDate} providerMode={workspace.providerStatus.mode} />;
}
