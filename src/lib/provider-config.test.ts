import { describe, expect, it } from "vitest";
import { resolveGoogleCredentials, selectAiProvider } from "./provider-config";

describe("hosting credentials", () => {
  it("uses the supplied OpenAI key even when built-in AI is available", () => {
    expect(selectAiProvider({ openai: "test-openai", lovable: "test-lovable" })).toBe("openai");
  });
  it("retains built-in AI when no own key is configured", () => {
    expect(selectAiProvider({ lovable: "test-lovable" })).toBe("lovable");
  });
  it("explains missing AI configuration", () => {
    expect(() => selectAiProvider({})).toThrow("Add OPENAI_API_KEY");
  });
  it("recognizes the Google OAuth names supplied by the user", () => {
    expect(resolveGoogleCredentials({ GOOGLE_OAUTH_CLIENT_ID: "test-id", GOOGLE_OAUTH_CLIENT_SECRET: "test-secret", GOOGLE_REFRESH_TOKEN: "test-refresh" })).toEqual({ clientId: "test-id", clientSecret: "test-secret", refreshToken: "test-refresh" });
  });
  it("does not treat client credentials as Google account consent", () => {
    expect(resolveGoogleCredentials({ GOOGLE_OAUTH_CLIENT_ID: "test-id", GOOGLE_OAUTH_CLIENT_SECRET: "test-secret" }).refreshToken).toBeUndefined();
  });
});