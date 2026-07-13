import type { ProfileRankingKey } from "../api/fetchProfileRankings";

export type TopRanking = {
  label: string;
  rank: number;
  key: ProfileRankingKey;
};
