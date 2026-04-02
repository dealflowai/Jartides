export type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const json = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(json);
      break;
    case "warn":
      console.warn(json);
      break;
    default:
      console.log(json);
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    emit("info", message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    emit("warn", message, context);
  },
  error(message: string, context?: Record<string, unknown>) {
    emit("error", message, context);
  },

  /** Create a child logger with default context fields attached to every log. */
  child(defaults: Record<string, unknown>) {
    return {
      info(message: string, ctx?: Record<string, unknown>) {
        emit("info", message, { ...defaults, ...ctx });
      },
      warn(message: string, ctx?: Record<string, unknown>) {
        emit("warn", message, { ...defaults, ...ctx });
      },
      error(message: string, ctx?: Record<string, unknown>) {
        emit("error", message, { ...defaults, ...ctx });
      },
    };
  },
};
