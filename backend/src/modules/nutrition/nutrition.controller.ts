import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type {
  AddFoodEntryRequest,
  FoodCatalogItemView,
  FoodEntryWriteResult,
  NutritionAnalysisResult,
} from "./nutrition.contract.js";
import type { NutritionService } from "./nutrition.service.js";

export class NutritionController {
  constructor(private readonly service: NutritionService) {}

  listFoodCatalog(ctx: RequestContext): Promise<ApiEnvelope<FoodCatalogItemView[]>> {
    return this.service.listFoodCatalog(ctx);
  }

  addFoodEntry(
    ctx: RequestContext,
    logDate: string,
    input: AddFoodEntryRequest
  ): Promise<ApiEnvelope<FoodEntryWriteResult>> {
    return this.service.addFoodEntry(ctx, logDate, input);
  }

  getNutritionAnalysis(ctx: RequestContext, logDate: string): Promise<ApiEnvelope<NutritionAnalysisResult>> {
    return this.service.getNutritionAnalysis(ctx, logDate);
  }
}
