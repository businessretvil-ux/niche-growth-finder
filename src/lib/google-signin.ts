// Opens Google's sign-in popup in the browser and returns an access token for the student's own account.
type TokenResponse = { access_token?: string; error?: string; error_description?: string };
type GoogleOAuth = {
  accounts: { oauth2: { initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: TokenResponse) => void; error_callback?: (e: { type?: string; message?: string }) => void }) => { requestAccessToken: () => void } } };
};

let loader: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if ((window as unknown as { google?: GoogleOAuth }).google?.accounts?.oauth2) return Promise.resolve();
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loader = null; reject(new Error("Couldn't load Google sign-in.")); };
    document.head.appendChild(s);
  });
  return loader;
}

export async function getGoogleAccessToken(clientId: string): Promise<string> {
  if (!clientId) throw new Error("Google sign-in is not configured (missing GOOGLE_OAUTH_CLIENT_ID).");
  await loadGis();
  const google = (window as unknown as { google: GoogleOAuth }).google;
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (r) => (r.access_token ? resolve(r.access_token) : reject(new Error(r.error_description || r.error || "Google sign-in was cancelled."))),
      error_callback: (e) => reject(new Error(e.type === "popup_closed" ? "Google sign-in was closed." : e.message || "Google sign-in failed.")),
    });
    client.requestAccessToken();
  });
}
