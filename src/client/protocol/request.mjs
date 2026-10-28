import { requestJson } from "../http/request-json.mjs";
import { createClientAuthentication } from "./create-authentication.mjs";

export async function requestToken(fetchImplementation, config, metadata, parameters) {
  const authentication = createClientAuthentication(config, metadata);
  const body = new URLSearchParams({ ...parameters, ...authentication.parameters });
  return requestJson(fetchImplementation, metadata.token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...authentication.headers,
    },
    body,
    timeoutMs: config.timeoutMs,
    retry: false,
  });
}
