import { createEliDClient } from "@eliware/elid-client";

const required = ["ELID_ISSUER_URL", "ELID_CLIENT_ID", "ELID_REDIRECT_URI", "ELID_SCOPES"];
for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Set ${name} before running this example.`);
  }
}

const client = createEliDClient({
  issuer: process.env.ELID_ISSUER_URL,
  clientId: process.env.ELID_CLIENT_ID,
  redirectUri: process.env.ELID_REDIRECT_URI,
  scopes: process.env.ELID_SCOPES.split(" "),
  clientSecret: process.env.ELID_CLIENT_SECRET || undefined,
  resource: process.env.ELID_RESOURCE || undefined,
});

const metadata = await client.discover();
console.log(
  JSON.stringify(
    {
      issuer: metadata.issuer,
      authorizationEndpoint: metadata.authorization_endpoint,
      tokenEndpoint: metadata.token_endpoint,
      userInfoEndpoint: metadata.userinfo_endpoint,
      jwksUri: metadata.jwks_uri,
    },
    null,
    2,
  ),
);
