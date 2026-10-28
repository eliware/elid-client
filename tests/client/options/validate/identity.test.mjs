import { expect, test } from "@jest/globals";
import { validateIdentity } from "../../../../src/client/options/validate/identity.mjs";

const issuer = "https://issuer.example";
const identity = { issuer, subject: "user-1" };

test("allows an omitted identity and accepts one from the configured issuer", () => {
  expect(validateIdentity(undefined, issuer)).toBeUndefined();
  expect(validateIdentity(identity, issuer)).toBe(identity);
});

test.each([
  [null, issuer],
  ["invalid", issuer],
  [{ ...identity, issuer: "https://other.example" }, issuer],
  [{ ...identity, subject: 1 }, issuer],
  [{ ...identity, subject: "" }, issuer],
])("rejects an invalid previous identity", (value, configuredIssuer) => {
  expect(() => validateIdentity(value, configuredIssuer)).toThrow(
    expect.objectContaining({ code: "invalid_argument" }),
  );
});
