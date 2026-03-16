export type capitalizeConfig = {
  mode: "capitalize" | "uppercase" | "lowercase" | "titlecase";
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

  if (fields.length === 0) {
    Object.entries(payload).forEach(([key, value]) => {
      if (ignoreFields.includes(key) || typeof value !== "string") return;

      const data = (result.data as Record<string, unknown>) || {};
      if (typeof value === "string") {
        data[key] = modeProcessor(mode, value);
      }
      result.data = data;
    });
  } else {
    fields.forEach((field) => {
      if (ignoreFields.includes(field) || typeof payload[field] !== "string") {
        return;
      }

      const data = (result.data as Record<string, unknown>) || {};
      const value = (payload as Record<string, unknown>)[field];

      data[field] = modeProcessor(mode, value);

      result.data = data;
    });
  }

  result._processedAt = new Date().toISOString();
  result._completed = true;
  return result;
}

function modeProcessor(mode: unknown, value: string): string {
  if (typeof mode !== "string") return value;

  switch (mode) {
    case "uppercase":
      return toUpperCase(value);
    case "lowercase":
      return toLowerCase(value);
    case "capitalize":
      return toCapitalize(value);
    case "titlecase":
      return toTitleCase(value);
    default:
      return value;
  }
}

function toUpperCase(value: string): string {
  return value.toUpperCase();
}

function toLowerCase(value: string): string {
  return value.toLowerCase();
}

function toCapitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(" ")
    .map((s) => toCapitalize(s))
    .join(" ");
}
