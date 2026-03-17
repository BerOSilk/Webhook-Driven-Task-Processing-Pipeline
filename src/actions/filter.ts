type filterModes = "omit" | "redaction" | "masking";

export type filterConfig = {
  mode: filterModes;
  fields: string[];
  ignoreFields: string[];
};

export function filterAction(
  payload: Record<string, unknown>,
  config: filterConfig,
) {
  const { mode = "redaction", fields = [], ignoreFields = [] } = config;

  const sensitiveFeilds = [
    ...fields.map((field) => field.toLowerCase()),
    "password",
    "token",
    "credit_card",
    "ssn",
    "api_key",
  ];

  const result: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (
      ignoreFields.includes(key.toLowerCase()) ||
      !sensitiveFeilds.includes(key.toLowerCase())
    ) {
      result[key] = value;
      return;
    }
    if (mode === "omit") return;
    result[key] = filterProcessor(mode, value);
  });
  return result;
}

function filterProcessor(mode: string, value: unknown) {
  switch (mode) {
    case "redaction":
      return "[REDACTED]";
    case "masking":
      return mask(value);
    default:
      return value;
  }
}

function mask(value: unknown) {
  const str = String(value);
  if (str.length <= 4) return "****";

  return "****" + str.slice(-4);
}
