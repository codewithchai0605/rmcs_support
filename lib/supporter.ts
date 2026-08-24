// One id per browser, stored in an httpOnly cookie so it's readable during
// server-side rendering (unlike localStorage, which only exists client-side
// and would force an extra client fetch + loading flash on first paint).
// This is a simple, spoofable way to count "one supporter" -- fine for a
// support button, not meant to be a strong identity system.
export const SUPPORTER_COOKIE_NAME = "rmcsSupporterId";
