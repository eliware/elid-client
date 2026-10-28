import { expect, test } from "@jest/globals";
import { readResponseText } from "../../../../../src/client/http/read/response/text.mjs";

test("dispatches to streamed and fallback readers", async () => {
  await expect(readResponseText(new Response("streamed"))).resolves.toBe("streamed");
  await expect(readResponseText({ text: async () => "fallback" })).resolves.toBe("fallback");
});
