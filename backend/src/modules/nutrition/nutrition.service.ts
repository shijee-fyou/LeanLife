import type { ApiEnvelope, RequestContext } from "../../shared/core-types.js";
import type {
  AddFoodEntryRequest,
  FoodCatalogItemView,
  FoodEntryWriteResult,
  NutritionAnalysisResult,
  NutritionModule,
} from "./nutrition.contract.js";
import type { NutritionRepository } from "./nutrition.repository.js";

export class NutritionService implements NutritionModule {
  constructor(private readonly repository: NutritionRepository) {}

  async listFoodCatalog(ctx: RequestContext): Promise<ApiEnvelope<FoodCatalogItemView[]>> {
    const result = await this.repository.listFoodCatalog(ctx);
    return {
      data: result,
    };
  }

  async addFoodEntry(
    ctx: RequestContext,
    logDate: string,
    input: AddFoodEntryRequest
  ): Promise<ApiEnvelope<FoodEntryWriteResult>> {
    const result = await this.repository.addFoodEntry(ctx, logDate, input);
    return {
      data: result,
      meta: {
        algorithmVersion: result.analysis.algorithmVersion,
      },
    };
  }

  async getNutritionAnalysis(ctx: RequestContext, logDate: string): Promise<ApiEnvelope<NutritionAnalysisResult>> {
    const result = await this.repository.getNutritionAnalysis(ctx, logDate);
    return {
      data: result,
      meta: {
        algorithmVersion: result.algorithmVersion,
      },
    };
  }
}
