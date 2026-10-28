import { expect, test } from "@jest/globals";
import { createOidcKeys } from "../../../test-fixtures/create-oidc-keys.mjs";
import { verifyIdToken } from "../../../src/client/protocol/verify-id-token.mjs";

const issuer = "https://issuer.example";
const clientId = "web-app";
const nonce = "nonce-value";
const now = Date.UTC(2026, 0, 1, 0, 0, 0);
const validation = (publicKey, overrides = {}) => ({
  issuer,
  clientId,
  nonce,
  algorithms: ["RS256"],
  now: () => now,
  clockToleranceSeconds: 0,
  keyResolver: publicKey,
  ...overrides,
});

test("verifies ID Token signature, issuer, audience, time, subject, and nonce", async () => {
  const keys = await createOidcKeys();
  const token = await keys.sign(
    { nonce, iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer,
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(token, validation(keys.publicKey))).resolves.toMatchObject({
    iss: issuer,
    aud: clientId,
    sub: "user-1",
    nonce,
  });
});

test("rejects empty tokens, bad signatures, issuers, audiences, and expired claims", async () => {
  const keys = await createOidcKeys();
  const other = await createOidcKeys();
  await expect(verifyIdToken("", validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const good = await keys.sign(
    { nonce, iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer,
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(good, validation(other.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const wrongIssuer = await keys.sign(
    { nonce, iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer: "https://other.example",
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(wrongIssuer, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const wrongAudience = await keys.sign(
    { nonce, iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer,
      audience: "another-client",
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(wrongAudience, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const expired = await keys.sign(
    { nonce, iat: now / 1000 - 500, exp: now / 1000 - 1 },
    {
      issuer,
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000 - 500,
      expiresAt: now / 1000 - 1,
    },
  );
  await expect(verifyIdToken(expired, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
});

test("rejects missing identity claims and future issue times", async () => {
  const keys = await createOidcKeys();
  const missingSubject = await keys.sign(
    { nonce, iat: now / 1000, exp: now / 1000 + 300 },
    { issuer, audience: clientId, issuedAt: now / 1000, expiresAt: now / 1000 + 300 },
  );
  await expect(verifyIdToken(missingSubject, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const futureIssued = await keys.sign(
    { nonce, iat: now / 1000 + 30, exp: now / 1000 + 300 },
    {
      issuer,
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000 + 30,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(futureIssued, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
});

test("validates authorized party and multi-audience tokens", async () => {
  const keys = await createOidcKeys();
  const claims = { nonce, iat: now / 1000, exp: now / 1000 + 300 };
  const make = (audience, extra = {}) =>
    keys.sign(
      { ...claims, ...extra },
      { issuer, audience, subject: "user-1", issuedAt: now / 1000, expiresAt: now / 1000 + 300 },
    );
  const wrongParty = await make(clientId, { azp: "other-client" });
  await expect(verifyIdToken(wrongParty, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const missingParty = await make([clientId, "other-client"]);
  await expect(verifyIdToken(missingParty, validation(keys.publicKey))).rejects.toMatchObject({
    code: "invalid_id_token",
  });
  const validParty = await make([clientId, "other-client"], { azp: clientId });
  await expect(verifyIdToken(validParty, validation(keys.publicKey))).resolves.toMatchObject({
    azp: clientId,
  });
});

test("rejects a nonce that does not match the transaction", async () => {
  const keys = await createOidcKeys();
  const token = await keys.sign(
    { nonce: "other-nonce", iat: now / 1000, exp: now / 1000 + 300 },
    {
      issuer,
      audience: clientId,
      subject: "user-1",
      issuedAt: now / 1000,
      expiresAt: now / 1000 + 300,
    },
  );
  await expect(verifyIdToken(token, validation(keys.publicKey))).rejects.toMatchObject({
    code: "nonce_mismatch",
  });
});
