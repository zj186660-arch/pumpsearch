/** Abort after `ms` ms. Prefer `AbortSignal.timeout` when available (Node 18+). */
export function abortSignalAfter(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  if (typeof t === "object" && t && "unref" in t) (t as NodeJS.Timeout).unref();
  return c.signal;
}
