export type capitalizeConfig = {
  mode: "uppercase" | "lowercase";
  fields?: string[];
  ignoreFields?: string[];
};

export function capitalizeAction(
  payload: Record<string, unknown>,
  config: capitalizeConfig,
) {
  const result: Record<string, unknown> = {
    data: { ...payload },
  };

  const { mode = "uppercase", fields = [], ignoreFields = [] } = config;

  fields.forEach((field) => {
    if (ignoreFields.includes(field) || typeof payload[field] !== "string") {
      return;
    }

    const data = (result.data as Record<string, unknown>) || {};
    const value = (payload as Record<string, unknown>)[field];
    if (typeof value === "string") {
      data[field] =
        mode === "uppercase" ? value.toUpperCase() : value.toLowerCase();
    }
    result.data = data;
  });

  result._processedAt = new Date().toISOString();
  result._completed = true;
  return result;
}
