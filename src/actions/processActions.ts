import { NotFoundError } from "../errors.js";
import { capitalizeAction, capitalizeConfig } from "./capitalize.js";
import { filterAction, filterConfig } from "./filter.js";
import { replaceAction, ReplaceConfig } from "./replace.js";

export async function processAction(
  actionType: string,
  payload: Record<string, unknown>,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const realPayload = (() => {
    return payload.method === "POST" ? payload.body : payload.query;
  })();

  switch (actionType) {
    case "capitalize":
      return capitalizeAction(
        realPayload as Record<string, unknown>,
        config as capitalizeConfig,
      );
    case "replace":
      return replaceAction(
        realPayload as Record<string, unknown>,
        config as ReplaceConfig,
      );
    case "filter":
      return filterAction(
        realPayload as Record<string, unknown>,
        config as filterConfig,
      )
    default:
      throw new NotFoundError("Undefined Action");
  }
}
