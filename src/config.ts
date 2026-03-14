process.loadEnvFile();

const config = {
  PORT: getFromEnv("PORT") || 8080,
  DB_URL: getFromEnv("DB_URL") || "",
  INTERVAL_MS: getFromEnv("INTERVAL_MS") || 1000,
  MAX_ATTEMPTS: getFromEnv("MAX_ATTEMPTS") || 5,
};

function getFromEnv(key: string) {
  const value = process.env?.[key];
  if (!value) {
    console.log(`${key} is not initialized using default`);
    return null;
  } else {
    return value;
  }
}

export { config };
