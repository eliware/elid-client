import { ElidClientError } from "../errors/client-error.mjs";
import { requestJson } from "../http/request-json.mjs";

export async function getUserInfo(
  fetchImplementation,
  config,
  metadata,
  accessToken,
  expectedSubject,
) {
  if (typeof metadata.userinfo_endpoint !== "string") {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not advertise a UserInfo endpoint.",
    );
  }
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new ElidClientError("invalid_argument", "accessToken must be a nonempty string.");
  }
  if (typeof expectedSubject !== "string" || expectedSubject.length === 0) {
    throw new ElidClientError("invalid_argument", "expectedSubject must be a nonempty string.");
  }
  const claims = await requestJson(fetchImplementation, metadata.userinfo_endpoint, {
    method: "GET",
    headers: { authorization: `Bearer ${accessToken}` },
    timeoutMs: config.timeoutMs,
  });
  if (typeof claims.sub !== "string" || claims.sub.length === 0 || claims.sub !== expectedSubject) {
    throw new ElidClientError(
      "invalid_userinfo",
      "UserInfo subject does not match the ID Token subject.",
    );
  }
  return claims;
}
