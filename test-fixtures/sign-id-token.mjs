import { SignJWT } from "jose";

export async function signIdToken(privateKey, claims, options = {}) {
  const header = { alg: options.algorithm ?? "RS256", kid: "smoke-test-key" };
  let builder = new SignJWT(claims).setProtectedHeader(header);
  if (options.issuer !== undefined) builder = builder.setIssuer(options.issuer);
  if (options.audience !== undefined) builder = builder.setAudience(options.audience);
  if (options.subject !== undefined) builder = builder.setSubject(options.subject);
  if (options.issuedAt !== undefined) builder = builder.setIssuedAt(options.issuedAt);
  if (options.expiresAt !== undefined) builder = builder.setExpirationTime(options.expiresAt);
  return builder.sign(privateKey);
}
