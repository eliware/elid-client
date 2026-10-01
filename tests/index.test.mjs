import { expect, test } from "@jest/globals";
import { createGreeting } from "../src/index.mjs";

test("exports the public greeting function", () => {
  expect(createGreeting("Eliware")).toBe("Hello, Eliware!");
});
