import { ElidClientError } from "../../errors/client-error.mjs";
import { readResponseText } from "./response/text.mjs";

export async function readOAuthError(response) {
  const contentType = response.headers?.get?.("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return undefined;
  try {
    const value = JSON.parse(await readResponseText(response));
    if (typeof value?.error !== "string") return undefined;
    const error = new ElidClientError(
      "oauth_error",
      "The identity provider returned an OAuth error.",
      response.status,
    );
    error.oauthCode = value.error;
    return error;
  } catch {
    return undefined;
  }
}
