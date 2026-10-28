import { expect, test } from "@jest/globals";
import { createGreeting } from "../src/create-greeting.mjs";

test("uses the default name when omitted", () => {
  expect(createGreeting()).toBe("Hello, world!");
});

test("includes a supplied name", () => {
  expect(createGreeting("Eli")).toBe("Hello, Eli!");
});

test("preserves an empty supplied name", () => {
  expect(createGreeting("")).toBe("Hello, !");
});

test("preserves leading and trailing spaces in a name", () => {
  expect(createGreeting(" Eli ")).toBe("Hello,  Eli !");
});
