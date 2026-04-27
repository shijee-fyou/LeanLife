export interface ApplicationSummary {
  environment: string;
  modules: string[];
}

const MODULE_NAMES = ["auth", "profile", "assessments", "tracking", "nutrition"] as const;

export function createModuleRegistry() {
  return {
    list(): string[] {
      return [...MODULE_NAMES];
    },
  };
}
