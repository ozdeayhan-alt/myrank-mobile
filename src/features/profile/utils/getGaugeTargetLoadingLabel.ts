import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";

export function getGaugeTargetLoadingLabel(
  gaugeVoteMode: GaugeVoteMode = null
): string {
  if (gaugeVoteMode === "down") {
    return "Alçaltma sıralaması hesaplanıyor";
  }
  return "Yükselme sıralaması hesaplanıyor";
}
