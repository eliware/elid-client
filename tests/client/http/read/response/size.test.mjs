import { expect, test } from "@jest/globals";
import { validateResponseSize } from "../../../../../src/client/http/read/response/size.mjs";

test("accepts responses up to the byte limit", () => {
  expect(() => validateResponseSize(1000000)).not.toThrow();
});

test("rejects responses above the byte limit", () => {
  expect(() => validateResponseSize(1000001)).toThrow(
    "The identity provider response is too large.",
  );
});
