import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type { CalendarMonthStatus, DailyLogDetail, TrendQuery, TrendResult, UpsertDailyLogRequest } from "./tracking.contract.js";
import type { TrackingService } from "./tracking.service.js";

export class TrackingController {
  constructor(private readonly service: TrackingService) {}

  getDailyLog(ctx: RequestContext, logDate: string): Promise<ApiEnvelope<DailyLogDetail>> {
    return this.service.getDailyLog(ctx, logDate);
  }

  upsertDailyLog(
    ctx: RequestContext,
    logDate: string,
    input: UpsertDailyLogRequest
  ): Promise<ApiEnvelope<DailyLogDetail>> {
    return this.service.upsertDailyLog(ctx, logDate, input);
  }

  getTrend(ctx: RequestContext, query: TrendQuery): Promise<ApiEnvelope<TrendResult>> {
    return this.service.getTrend(ctx, query);
  }

  getCalendarMonthStatus(ctx: RequestContext, year: number, month: number): Promise<ApiEnvelope<CalendarMonthStatus>> {
    return this.service.getCalendarMonthStatus(ctx, year, month);
  }
}
