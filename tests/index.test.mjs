import { expect, test } from "@jest/globals";
import { createEliDClient, ElidClientError } from "../src/index.mjs";

test("exports the EliD client factory and typed error", () => {
  expect(typeof createEliDClient).toBe("function");
  expect(new ElidClientError("invalid_argument", "Invalid input.")).toMatchObject({
    name: "ElidClientError",
    code: "invalid_argument",
  });
});
