import { expect, jest, test } from "@jest/globals";
import { readResponseStream } from "../../../../../src/client/http/read/response/stream.mjs";

function createReader(chunks, cancel = async () => {}, close = true) {
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      if (close) controller.close();
    },
    cancel,
  });
  return body.getReader();
}

test("reads streamed response chunks", async () => {
  await expect(
    readResponseStream(
      createReader([new TextEncoder().encode('{"ok":'), new TextEncoder().encode("true}")]),
    ),
  ).resolves.toBe('{"ok":true}');
});

test("rejects oversized streams and stops reading", async () => {
  const cancel = jest.fn();
  await expect(
    readResponseStream(createReader([new Uint8Array(1000001)], cancel, false)),
  ).rejects.toMatchObject({
    code: "invalid_response",
    message: "The identity provider response is too large.",
  });
  expect(cancel).toHaveBeenCalledTimes(1);
  const failedCancel = async () => {
    throw new Error("private cancel detail");
  };
  await expect(
    readResponseStream(createReader([new Uint8Array(1000001)], failedCancel, false)),
  ).rejects.toMatchObject({ code: "invalid_response" });
});

test("maps stream read failures to a safe response error", async () => {
  const body = new ReadableStream({
    pull() {
      throw new Error("private stream detail");
    },
  });
  await expect(readResponseStream(body.getReader())).rejects.toMatchObject({
    code: "invalid_response",
    message: "The identity provider response could not be read.",
  });
});
