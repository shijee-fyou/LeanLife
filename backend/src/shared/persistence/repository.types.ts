import type { ISODate, UUID } from "../core-types.js";

export interface DateScopedQuery {
  userId: UUID;
  logDate: ISODate;
}

export interface RepositoryHealth {
  name: string;
  ready: boolean;
}
