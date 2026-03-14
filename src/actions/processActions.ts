import { NotFoundError } from "../errors.js";
import { capitalizeAction, capitalizeConfig } from "./capitalize.js";

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
    default:
      throw new NotFoundError("Undefined Action");
  }
}
