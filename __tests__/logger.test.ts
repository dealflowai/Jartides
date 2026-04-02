import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("emits JSON to console.log for info", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message");

    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.timestamp).toBeDefined();
  });

  it("emits JSON to console.error for error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("something broke", { orderId: "123" });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("error");
    expect(parsed.orderId).toBe("123");
  });

  it("emits JSON to console.warn for warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("heads up");

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
  });

  it("includes extra context fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("checkout", { orderNumber: "JRT-ABC123", total: 99.99 });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.orderNumber).toBe("JRT-ABC123");
    expect(parsed.total).toBe(99.99);
  });

  it("child logger attaches default context", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const orderLog = logger.child({ orderId: "ord_1", route: "/api/checkout" });
    orderLog.info("processing");

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.orderId).toBe("ord_1");
    expect(parsed.route).toBe("/api/checkout");
    expect(parsed.message).toBe("processing");
  });

  it("child logger merges per-call context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = logger.child({ route: "/api/webhook" });
    log.error("failed", { code: 500 });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.route).toBe("/api/webhook");
    expect(parsed.code).toBe(500);
  });
});
