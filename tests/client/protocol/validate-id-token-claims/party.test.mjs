import { expect, test } from "@jest/globals";
import { validateIdTokenParty } from "../../../../src/client/protocol/validate-id-token-claims/party.mjs";

test("accepts a single audience or a matching authorized party", () => {
  expect(validateIdTokenParty({ aud: "web-app" }, { clientId: "web-app" })).toBeUndefined();
  expect(
    validateIdTokenParty({ aud: ["web-app", "other"], azp: "web-app" }, { clientId: "web-app" }),
  ).toBeUndefined();
});

test.each([
  [{ azp: "other" }, "ID Token authorized party does not match the client."],
  [{ azp: 7 }, "ID Token authorized party does not match the client."],
  [{ aud: ["web-app", "other"] }, "ID Token audience requires a matching authorized party."],
  [{ aud: ["web-app", "other"], azp: 7 }, "ID Token authorized party does not match the client."],
])("rejects an invalid authorized party", (payload, message) => {
  expect(() => validateIdTokenParty(payload, { clientId: "web-app" })).toThrow(message);
});
