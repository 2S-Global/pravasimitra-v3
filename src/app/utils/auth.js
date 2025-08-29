export function hasTokenCookie() {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith("token="));
}
