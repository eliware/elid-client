import { createEliDClient } from "../src/index.mjs";

function required(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Set ${name} in the local smoke environment.`);
  }
  return value;
}

const issuer = required("ELID_ISSUER_URL");
const issuerUrl = new URL(issuer);
if (
  issuerUrl.protocol !== "https:" ||
  !["localhost", "127.0.0.1", "[::1]"].includes(issuerUrl.hostname)
) {
  throw new Error("The local smoke runner requires an HTTPS loopback issuer.");
}
const username = required("ELID_TEST_USERNAME");
const password = required("ELID_TEST_PASSWORD");
const scopes = required("ELID_SCOPES").split(" ").filter(Boolean);
const client = createEliDClient({
  issuer,
  clientId: required("ELID_CLIENT_ID"),
  clientSecret: process.env.ELID_CLIENT_SECRET || undefined,
  redirectUri: required("ELID_REDIRECT_URI"),
  scopes,
  resource: process.env.ELID_RESOURCE || undefined,
});

const metadata = await client.discover();
const authorization = await client.createAuthorizationRequest();
const loginPage = await fetch(authorization.authorizationUrl, { redirect: "manual" });
const loginHtml = await loginPage.text();
if (
  loginPage.status !== 200 ||
  !loginHtml.includes('name="username"') ||
  !loginHtml.includes('name="password"')
) {
  throw new Error("The issuer did not return its expected branded login page.");
}

const loginResponse = await fetch(authorization.authorizationUrl, {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    origin: issuerUrl.origin,
    "x-forwarded-proto": "https",
  },
  body: JSON.stringify({ username, password }),
  redirect: "manual",
});
const loginResult = await loginResponse.json();
if (loginResponse.status !== 200 || typeof loginResult.redirect_url !== "string") {
  throw new Error("The issuer rejected local smoke sign-in.");
}

const callback = new URL(loginResult.redirect_url);
const expectedRedirect = new URL(authorization.transaction.redirectUri);
if (
  callback.origin !== expectedRedirect.origin ||
  callback.pathname !== expectedRedirect.pathname ||
  callback.searchParams.get("state") !== authorization.transaction.state
) {
  throw new Error("The issuer returned an unexpected authorization callback.");
}
const code = callback.searchParams.get("code");
if (!code) throw new Error("The issuer returned no authorization code.");
const tokens = await client.exchangeAuthorizationCode({
  code,
  state: callback.searchParams.get("state"),
  transaction: authorization.transaction,
});
if (!tokens.refreshToken) throw new Error("The issuer returned no refresh token.");
await client.getUserInfo(tokens.accessToken, tokens.identity.subject);
const refreshed = await client.refreshTokens({
  refreshToken: tokens.refreshToken,
  nonce: authorization.transaction.nonce,
});
if (!refreshed.refreshToken || refreshed.refreshToken === tokens.refreshToken) {
  throw new Error("The issuer did not rotate the refresh token.");
}
await client.revokeToken(refreshed.refreshToken, "refresh_token");
console.log(
  `Local smoke checks passed for ${metadata.issuer}: discovery, login, code exchange, ID Token, UserInfo, refresh rotation, and revocation.`,
);
