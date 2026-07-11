/* Minimal structured JSON logger. Swap for pino/winston -> ELK in production. */
type Level = "info" | "warn" | "error" | "fatal";

function log(level: Level, message: string, meta?: unknown): void {
  const entry = {
    level,
    message,
    meta: meta instanceof Error ? { message: meta.message, stack: meta.stack } : meta,
    timestamp: new Date().toISOString(),
  };
  const line = JSON.stringify(entry);
  if (level === "error" || level === "fatal") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
  fatal: (message: string, meta?: unknown) => log("fatal", message, meta),
};
