export type Match = {
  id: number;
  stage: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "finished";
  allow_late_predictions: boolean;
};

export type Prediction = {
  id: number;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
  confirmed: boolean;
};

export type AppSetting = {
  key: string;
  value: string;
};

export type RankingRow = {
  user_id: string;
  username: string;
  display_name: string;
  total_points: number;
  total_exact: number;
  total_result: number;
  total_palpites: number;
};
