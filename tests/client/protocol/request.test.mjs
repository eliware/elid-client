import { expect, jest, test } from "@jest/globals";
import { requestToken } from "../../../src/client/protocol/request.mjs";

test("posts a form-encoded token request with discovered client authentication", async () => {
  const fetcher = jest.fn(async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify({ access_token: "access", token_type: "Bearer" }),
  }));
  const result = await requestToken(
    fetcher,
    { clientId: "web-app", clientSecret: "secret", timeoutMs: 1000 },
    {
      token_endpoint: "https://issuer.example/token",
      token_endpoint_auth_methods_supported: ["client_secret_basic"],
    },
    {
      grant_type: "authorization_code",
      code: "code",
      redirect_uri: "https://app.example/callback",
    },
  );
  expect(result.access_token).toBe("access");
  expect(fetcher.mock.calls[0][0]).toBe("https://issuer.example/token");
  expect(fetcher.mock.calls[0][1].headers).toMatchObject({
    "content-type": "application/x-www-form-urlencoded",
    authorization: expect.stringMatching(/^Basic /),
  });
  expect(fetcher.mock.calls[0][1].body.toString()).toContain("grant_type=authorization_code");
});

test("does not send a token request when client authentication is unsupported", async () => {
  const fetcher = jest.fn();
  await expect(
    requestToken(
      fetcher,
      { clientId: "web-app", clientSecret: "secret", timeoutMs: 1000 },
      {
        token_endpoint: "https://issuer.example/token",
        token_endpoint_auth_methods_supported: ["none"],
      },
      { grant_type: "authorization_code" },
    ),
  ).rejects.toMatchObject({ code: "unsupported_client_authentication" });
  expect(fetcher).not.toHaveBeenCalled();
});
