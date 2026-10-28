import { ElidClientError } from "../errors/client-error.mjs";
import { requestJson } from "../http/request-json.mjs";
import { createClientAuthentication } from "./create-authentication.mjs";

export async function revokeToken(fetchImplementation, config, metadata, token, tokenTypeHint) {
  if (typeof metadata.revocation_endpoint !== "string") {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not advertise a revocation endpoint.",
    );
  }
  if (typeof token !== "string" || token.length === 0) {
    throw new ElidClientError("invalid_argument", "token must be a nonempty string.");
  }
  if (tokenTypeHint !== undefined && !["access_token", "refresh_token"].includes(tokenTypeHint)) {
    throw new ElidClientError(
      "invalid_argument",
      "tokenTypeHint must identify an access or refresh token.",
    );
  }
  const authentication = createClientAuthentication(config, metadata);
  const parameters = { token, ...authentication.parameters };
  if (tokenTypeHint) parameters.token_type_hint = tokenTypeHint;
  await requestJson(fetchImplementation, metadata.revocation_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...authentication.headers,
    },
    body: new URLSearchParams(parameters),
    timeoutMs: config.timeoutMs,
    retry: false,
    allowEmpty: true,
  });
}
