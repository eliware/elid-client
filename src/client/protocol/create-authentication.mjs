import { ElidClientError } from "../errors/client-error.mjs";

function encodeBasicValue(value) {
  return new URLSearchParams({ value }).toString().slice("value=".length);
}

export function createClientAuthentication(config, metadata) {
  const methods = metadata.token_endpoint_auth_methods_supported;
  if (config.clientSecret) {
    if (methods.includes("client_secret_basic")) {
      const credentials = `${encodeBasicValue(config.clientId)}:${encodeBasicValue(config.clientSecret)}`;
      return {
        headers: { authorization: `Basic ${Buffer.from(credentials).toString("base64")}` },
        parameters: {},
      };
    }
    if (methods.includes("client_secret_post")) {
      return {
        headers: {},
        parameters: { client_id: config.clientId, client_secret: config.clientSecret },
      };
    }
    throw new ElidClientError(
      "unsupported_client_authentication",
      "The issuer does not support configured client authentication.",
    );
  }
  if (methods.includes("none")) {
    return { headers: {}, parameters: { client_id: config.clientId } };
  }
  throw new ElidClientError(
    "client_secret_required",
    "The issuer requires a confidential client secret.",
  );
}
