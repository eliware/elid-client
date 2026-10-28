import { expect, jest, test } from "@jest/globals";
import log from "@eliware/log";
import { createGreeting } from "../src/create-greeting.mjs";

const silentLogger = { info: () => undefined };

test("uses the default name when omitted", () => {
  expect(createGreeting(undefined, { logger: silentLogger })).toBe("Hello, world!");
});

test("includes a supplied name", () => {
  expect(createGreeting("Eli", { logger: silentLogger })).toBe("Hello, Eli!");
});

test("preserves an empty supplied name", () => {
  expect(createGreeting("", { logger: silentLogger })).toBe("Hello, !");
});

test("preserves leading and trailing spaces in a name", () => {
  expect(createGreeting(" Eli ", { logger: silentLogger })).toBe("Hello,  Eli !");
});

test("sends structured operation details to an injected logger", () => {
  const logger = { info: jest.fn() };
  expect(createGreeting("Eli", { logger })).toBe("Hello, Eli!");
  expect(logger.info).toHaveBeenCalledWith("Greeting created", { operation: "createGreeting" });
  expect(JSON.stringify(logger.info.mock.calls)).not.toContain("Eli");
});

test("uses the package logger when callers do not inject a logger", () => {
  const silence = log.transports.map((transport) => transport.silent);
  log.transports.forEach((transport) => {
    transport.silent = true;
  });
  try {
    expect(createGreeting("Eli")).toBe("Hello, Eli!");
  } finally {
    log.transports.forEach((transport, index) => {
      transport.silent = silence[index];
    });
  }
});
