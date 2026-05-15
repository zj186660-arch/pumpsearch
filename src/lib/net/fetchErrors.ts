/**
 * Turn undici/Node "fetch failed" into a readable string (often includes errno in `cause`).
 */
export function formatFetchError(err: unknown): string {
  if (err instanceof Error) {
    const parts = [err.message];
    const c = (err as Error & { cause?: unknown }).cause;
    if (c instanceof Error) parts.push(`cause: ${c.message}`);
    else if (c != null && typeof c === "object" && "code" in c) {
      parts.push(`code: ${String((c as { code?: unknown }).code)}`);
    } else if (c != null) parts.push(`cause: ${String(c)}`);
    return parts.join(" · ");
  }
  return String(err);
}

export function fetchFailureHints(message: string): string[] {
  const m = message.toLowerCase();
  const hints: string[] = [];
  if (
    m.includes("econnrefused") ||
    m.includes("enotfound") ||
    m.includes("econnreset") ||
    m.includes("etimedout") ||
    m.includes("fetch failed")
  ) {
    hints.push("无法访问外网 API（Bing / SerpAPI / OpenAI）：请检查本机网络、公司防火墙、系统代理或 Node 的 HTTP(S)_PROXY。");
  }
  if (m.includes("cert") || m.includes("ssl") || m.includes("tls")) {
    hints.push("TLS/证书问题：检查系统时间、杀毒软件 HTTPS 扫描、公司 SSL 解密代理。");
  }
  if (m.includes("aborted") || m.includes("timeout")) {
    hints.push("请求超时：可提高网络质量，或在环境变量中调整 PUMPSEARCH_FETCH_TIMEOUT_MS。");
  }
  if (hints.length === 0) {
    hints.push("若为本地开发，可在 .env.local 设置 PUMPSEARCH_SKIP_NETWORK=true 暂时仅用演示数据。");
  }
  return hints;
}
