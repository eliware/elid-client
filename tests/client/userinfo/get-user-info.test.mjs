import { expect, jest, test } from "@jest/globals";
import { getUserInfo } from "../../../src/client/userinfo/get-user-info.mjs";

test("sends an opaque access token to the discovered UserInfo endpoint", async () => {
  const fetcher = jest.fn(async (_url, options) => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ sub: "user-1", preferred_username: "eli" }),
    options,
  }));
  await expect(
    getUserInfo(
      fetcher,
      { timeoutMs: 1000 },
      { userinfo_endpoint: "https://issuer.example/userinfo" },
      "opaque-access-token",
      "user-1",
    ),
  ).resolves.toEqual({ sub: "user-1", preferred_username: "eli" });
  expect(fetcher.mock.calls[0][1]).toMatchObject({
    method: "GET",
    headers: { authorization: "Bearer opaque-access-token" },
  });
});

test("rejects missing UserInfo capability and empty access tokens", async () => {
  await expect(
    getUserInfo(async () => {}, { timeoutMs: 1000 }, {}, "access"),
  ).rejects.toMatchObject({
    code: "unsupported_provider",
  });
  await expect(
    getUserInfo(
      async () => {},
      { timeoutMs: 1000 },
      { userinfo_endpoint: "https://issuer.example/userinfo" },
      "",
      "user-1",
    ),
  ).rejects.toMatchObject({ code: "invalid_argument" });
  await expect(
    getUserInfo(
      async () => {},
      { timeoutMs: 1000 },
      { userinfo_endpoint: "https://issuer.example/userinfo" },
      "access",
      "",
    ),
  ).rejects.toMatchObject({ code: "invalid_argument" });
});

test("rejects a UserInfo subject that does not match the verified ID Token", async () => {
  const fetcher = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ sub: "other-user" }),
  });
  await expect(
    getUserInfo(
      fetcher,
      { timeoutMs: 1000 },
      { userinfo_endpoint: "https://issuer.example/userinfo" },
      "opaque-access-token",
      "user-1",
    ),
  ).rejects.toMatchObject({ code: "invalid_userinfo" });
  const missing = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ preferred_username: "eli" }),
  });
  await expect(
    getUserInfo(
      missing,
      { timeoutMs: 1000 },
      { userinfo_endpoint: "https://issuer.example/userinfo" },
      "opaque-access-token",
      "user-1",
    ),
  ).rejects.toMatchObject({ code: "invalid_userinfo" });
});
