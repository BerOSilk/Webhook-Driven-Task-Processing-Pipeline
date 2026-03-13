process.loadEnvFile();

const config = {
  PORT: getFromEnv("PORT") || 8080,
  DB_URL: getFromEnv("DB_URL") || "",
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
