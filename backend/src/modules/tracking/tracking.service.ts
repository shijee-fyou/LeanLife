import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { CalendarMonthStatus, DailyLogDetail, TrackingModule, TrendQuery, TrendResult, UpsertDailyLogRequest } from "./tracking.contract.js";
import type { TrackingRepository } from "./tracking.repository.js";

export class TrackingService implements TrackingModule {
  constructor(private readonly repository: TrackingRepository) {}

  async getDailyLog(ctx: RequestContext, logDate: string): Promise<ApiEnvelope<DailyLogDetail>> {
    const detail = await this.repository.getDailyLog(ctx, logDate);
    return { data: detail };
  }

  async upsertDailyLog(
    ctx: RequestContext,
    logDate: string,
    input: UpsertDailyLogRequest
  ): Promise<ApiEnvelope<DailyLogDetail>> {
    const detail = await this.repository.upsertDailyLog(ctx, logDate, input);
    return { data: detail };
  }

  async getTrend(ctx: RequestContext, query: TrendQuery): Promise<ApiEnvelope<TrendResult>> {
    const trend = await this.repository.getTrend(ctx, query);
    return { data: trend };
  }

  async getCalendarMonthStatus(ctx: RequestContext, year: number, month: number): Promise<ApiEnvelope<CalendarMonthStatus>> {
    const status = await this.repository.getCalendarMonthStatus(ctx, year, month);
    return { data: status };
  }
}
