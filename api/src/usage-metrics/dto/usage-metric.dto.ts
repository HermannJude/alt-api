export class UsageMetricsSummaryDto {
  last_30_days!: {
    total_sessions: number;
    avg_session_minutes: number;
  };
}
