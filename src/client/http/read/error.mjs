import { ElidClientError } from "../../errors/client-error.mjs";
import { readResponseText } from "./response/text.mjs";

export async function readError(response) {
  const contentType = response.headers?.get?.("content-type") ?? "";
  if (contentType.toLowerCase().includes("application/json")) {
    try {
      const text = await readResponseText(response);
      const value = JSON.parse(text);
      if (typeof value?.error === "string") {
        const error = new ElidClientError(
          "oauth_error",
          "The identity provider returned an OAuth error.",
          response.status,
        );
        error.oauthCode = value.error;
        return error;
      }
    } catch {
      return new ElidClientError(
        "http_error",
        "The identity provider rejected the request.",
        response.status,
      );
    }
  }
  return new ElidClientError(
    "http_error",
    "The identity provider rejected the request.",
    response.status,
  );
}
