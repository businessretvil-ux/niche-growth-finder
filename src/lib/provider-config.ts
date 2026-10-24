export function selectAiProvider(keys: { openai?: string | undefined; lovable?: string | undefined }): "openai" | "lovable" {
  if (keys.openai) return "openai";
  if (keys.lovable) return "lovable";
  throw new Error("AI is not configured. Add OPENAI_API_KEY in your hosting environment and redeploy.");
}

export function resolveGoogleCredentials(env: Record<string, string | undefined>) {
  return {
    clientId: env['GOOGLE_OAUTH_CLIENT_ID'] || env['GOOGLE_CLIENT_ID'],
    clientSecret: env['GOOGLE_OAUTH_CLIENT_SECRET'] || env['GOOGLE_CLIENT_SECRET'],
    refreshToken: env['GOOGLE_OAUTH_REFRESH_TOKEN'] || env['GOOGLE_REFRESH_TOKEN'],
  };
}