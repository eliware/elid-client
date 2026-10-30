import { expect, test } from "@jest/globals";
import { validateTransactionState } from "../../../../src/client/authorization/validate-transaction/state.mjs";

const transaction = { state: "saved-state" };

function expectCode(callback, code) {
  let error;
  try {
    callback();
  } catch (caught) {
    error = caught;
  }
  expect(error).toMatchObject({ code });
}

test("accepts the matching response state", () => {
  expect(validateTransactionState("saved-state", transaction)).toBeUndefined();
});

test.each([undefined, "", "other"])("rejects response state %s", (state) => {
  expectCode(() => validateTransactionState(state, transaction), "state_mismatch");
});

test.each([null, undefined])("rejects a missing saved transaction", (value) => {
  expectCode(() => validateTransactionState("saved-state", value), "invalid_transaction");
});
