export function normalizeTokenResponse(response) {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    tokenType: "Bearer",
    expiresIn: response.expires_in,
    scope: response.scope,
    idToken: response.id_token,
  };
}
