import { defineConfig } from "drizzle-kit";
import { config } from "./dist/config.js";

export default defineConfig({
    schema: "dist/lib/db",
    out: "dist/lib/db-out",
    dialect: "postgresql",
    dbCredentials: {
        url: config.DB_URL,
    },
});