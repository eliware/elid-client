import { ElidClientError } from "../errors/client-error.mjs";
import { readError } from "./read/error.mjs";
import { readResponseText } from "./read/response/text.mjs";

export async function requestJson(fetchImplementation, url, options = {}) {
  const method = options.method ?? "GET";
  let response;
  try {
    response = await fetchImplementation(url, {
      method,
      headers: { accept: "application/json", ...options.headers },
      body: options.body,
      redirect: "error",
      signal: AbortSignal.timeout(options.timeoutMs ?? 5000),
    });
  } catch (error) {
    if (error instanceof ElidClientError) throw error;
    const timeout = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw new ElidClientError(
      timeout ? "request_timeout" : "network_error",
      timeout
        ? "The identity provider request timed out."
        : "The identity provider request failed.",
    );
  }
  if (!response.ok) {
    const transient = [502, 503, 504].includes(response.status);
    if (method === "GET" && transient && options.retry !== false) {
      return requestJson(fetchImplementation, url, { ...options, retry: false });
    }
    const error = await readError(response);
    throw error;
  }
  if (response.status === 204) {
    if (options.allowEmpty) return undefined;
    throw new ElidClientError(
      "invalid_response",
      "The identity provider returned an empty response.",
    );
  }
  const contentType = response.headers?.get?.("content-type") ?? "";
  const text = await readResponseText(response);
  if (options.allowEmpty && text.length === 0) return undefined;
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ElidClientError(
      "invalid_response",
      "The identity provider returned a non-JSON response.",
    );
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ElidClientError("invalid_response", "The identity provider returned malformed JSON.");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ElidClientError(
      "invalid_response",
      "The identity provider response must be an object.",
    );
  }
  if (typeof value.error === "string") {
    const error = new ElidClientError(
      "oauth_error",
      "The identity provider returned an OAuth error.",
      response.status,
    );
    error.oauthCode = value.error;
    throw error;
  }
  return value;
}
