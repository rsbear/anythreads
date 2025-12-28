import type { Anythreads } from "@anythreads/api";

export type AnythreadsPersonalizationContext = {
  instance: Anythreads | undefined;
  accountId: string | undefined;
};
