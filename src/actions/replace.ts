type replaceMode = "replace-first" | "replace-all" | "replace-last";

export type ReplaceConfig = {
  mode: replaceMode;
  words: string[];
  replaceWith: string[];
  goThrough?: boolean;
};

export function replaceAction(
  payload: Record<string, unknown>,
  config: ReplaceConfig,
) {
  if (config.words.length === 0 || config.replaceWith.length === 0) {
    return {
      data: { ...payload },
      _processedAt: new Date().toISOString(),
      _completed: true,
    };
  }

  if (!isReplaceMode(config.mode)) {
    config.mode = "replace-all";
  }

  const result: Record<string, unknown> = {};
  switch (config.mode) {
    case "replace-first":
      result.data = replaceFirst(payload, config);
      break;
    case "replace-all":
      result.data = replaceAll(payload, config);
      break;
    case "replace-last":
      result.data = replaceLast(payload, config);
  }

  result._processedAt = new Date().toISOString();
  result._completed = true;
  return result;
}

function replaceFirst(payload: Record<string, unknown>, config: ReplaceConfig) {
  const replaced = new Set<string>();
  const result: Record<string, unknown> = { ...payload };

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value !== "string") return;
    let str = value;
    config.words.forEach((word, idx) => {
      if (!config.goThrough && replaced.has(word)) return;
      str = str.replace(
        word,
        config.replaceWith[idx % config.replaceWith.length],
      );
      replaced.add(word);
    });
    result[key] = str;
  });
  return result;
}

function replaceAll(payload: Record<string, unknown>, config: ReplaceConfig) {
  const result: Record<string, unknown> = { ...payload };

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value !== "string") return;

    let str = value;

    config.words.forEach((word, idx) => {
      str = str.replaceAll(
        word,
        config.replaceWith[idx % config.replaceWith.length],
      );
    });
    result[key] = str;
  });
  return result;
}

function replaceLast(payload: Record<string, unknown>, config: ReplaceConfig) {
  const replaced = new Set<string>();
  const result: Record<string, unknown> = { ...payload };

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value !== "string") return;

    let str = value;

    config.words.forEach((word, idx) => {
      if (!config.goThrough && replaced.has(word)) return;
      str = replaceLastStr(
        str,
        word,
        config.replaceWith[idx % config.replaceWith.length],
      );
      replaced.add(word);
    });
    result[key] = str;
  });

  return result;
}

function replaceLastStr(
  str: string,
  search: string,
  replacement: string,
): string {
  const idx = str.lastIndexOf(search);
  if (idx === -1) return str;

  return str.slice(0, idx) + replacement + str.slice(idx + search.length);
}

function isReplaceMode(mode: unknown): mode is replaceMode {
  return (
    typeof mode === "string" &&
    ["replace-first", "replace-all", "replace-last"].includes(mode)
  );
}
