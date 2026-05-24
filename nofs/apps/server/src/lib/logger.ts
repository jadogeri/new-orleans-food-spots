import pino from "pino";
import { join } from "node:path";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: join(__dirname, "pino-pretty.js"),
          options: { colorize: true },
        },
      }),
});
