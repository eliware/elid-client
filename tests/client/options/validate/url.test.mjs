import { expect, test } from "@jest/globals";
import { validateUrl } from "../../../../src/client/options/validate/url.mjs";

test("accepts secure absolute URLs and preserves their form", () => {
  expect(validateUrl("https://issuer.example/path", "issuer").href).toBe(
    "https://issuer.example/path",
  );
});

test("allows HTTP only for loopback development URLs", () => {
  expect(validateUrl("http://localhost:8080", "issuer", { allowLoopbackHttp: true }).protocol).toBe(
    "http:",
  );
  expect(() => validateUrl("http://issuer.example", "issuer", { allowLoopbackHttp: true })).toThrow(
    "issuer must use HTTPS",
  );
  expect(() => validateUrl("http://localhost", "issuer")).toThrow("issuer must use HTTPS");
});

test("rejects malformed URLs and embedded credentials", () => {
  expect(() => validateUrl("not a URL", "issuer")).toThrow("issuer must be an absolute URL");
  expect(() => validateUrl("https://user:pass@issuer.example", "issuer")).toThrow(
    "issuer contains unsupported URL parts",
  );
  expect(() => validateUrl("https://@issuer.example", "issuer")).toThrow(
    "issuer contains unsupported URL parts",
  );
});

test("controls query strings and fragments", () => {
  expect(
    validateUrl("https://api.example/resource?tenant=1", "resource", { allowQuery: true }).search,
  ).toBe("?tenant=1");
  expect(() => validateUrl("https://api.example/resource?tenant=1", "resource")).toThrow(
    "resource contains unsupported URL parts",
  );
  expect(() =>
    validateUrl("https://api.example/resource#part", "resource", { allowQuery: true }),
  ).toThrow("resource contains unsupported URL parts");
});
