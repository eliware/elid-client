import { expect, test } from "@jest/globals";
import { createBasicExampleGreeting } from "../../src/examples/basic.mjs";

test("creates the greeting shown by the basic example", () => {
  expect(createBasicExampleGreeting({ info: () => undefined })).toBe("Hello, Eli!");
});
