import { ElidClientError } from "../errors/client-error.mjs";
import { requestToken } from "./request.mjs";

export async function requestRefreshToken(fetchImplementation, config, metadata, refreshToken) {
  if (typeof refreshToken !== "string" || refreshToken.length === 0) {
    throw new ElidClientError("invalid_argument", "refreshToken must be a nonempty string.");
  }
  if (metadata.grant_types_supported && !metadata.grant_types_supported.includes("refresh_token")) {
    throw new ElidClientError(
      "unsupported_provider",
      "The issuer does not support refresh tokens.",
    );
  }
  const parameters = { grant_type: "refresh_token", refresh_token: refreshToken };
  if (config.resource) parameters.resource = config.resource;
  return requestToken(fetchImplementation, config, metadata, parameters);
}
