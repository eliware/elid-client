import { expect, test } from "@jest/globals";
import { validateClientAuthentication } from "../../../../src/client/discovery/validate/client-authentication.mjs";

test("supports advertised authentication methods and the basic default", () => {
  expect(
    validateClientAuthentication({
      token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"],
    }),
  ).toEqual(["client_secret_basic", "client_secret_post", "none"]);
  expect(validateClientAuthentication({})).toEqual(["client_secret_basic"]);
});

test.each(["client_secret_basic", ["none", 7], ["private_key_jwt"], []])(
  "rejects unsupported client authentication metadata",
  (methods) => {
    expect(() =>
      validateClientAuthentication({ token_endpoint_auth_methods_supported: methods }),
    ).toThrow(expect.objectContaining({ code: "unsupported_provider" }));
  },
);
