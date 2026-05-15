import type { Dispatcher } from "undici";
import { ProxyAgent } from "undici";

/**
 * 解析可用于 Google API 的 HTTP(S) 代理 URL。
 * 优先级：GOOGLE_FETCH_PROXY > PUMPSEARCH_HTTPS_PROXY > HTTPS_PROXY > HTTP_PROXY
 */
export function resolveGoogleProxyUrl(): string | undefined {
  const u =
    process.env.GOOGLE_FETCH_PROXY?.trim() ||
    process.env.PUMPSEARCH_HTTPS_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim();
  return u || undefined;
}

/**
 * 是否对 Google API（CSE）请求使用代理。
 * - 设置 GOOGLE_USE_PROXY=false（或 0）→ 永不走代理（直连），即使环境里有 HTTPS_PROXY。
 * - 未设置且存在代理 URL → 走代理。
 * - 无代理 URL → 直连。
 *
 * 用于解决：代理端口未开（ECONNREFUSED 127.0.0.1:7890）时仍可通过直连或正确端口访问。
 */
export function shouldUseGoogleProxy(): boolean {
  const off = process.env.GOOGLE_USE_PROXY === "0" || process.env.GOOGLE_USE_PROXY === "false";
  if (off) return false;
  return Boolean(resolveGoogleProxyUrl());
}

let proxyAgent: ProxyAgent | null | undefined;

function getProxyAgent(): ProxyAgent | null {
  const url = resolveGoogleProxyUrl();
  if (!url) return null;
  if (proxyAgent !== undefined) return proxyAgent;
  try {
    proxyAgent = new ProxyAgent(url);
  } catch {
    proxyAgent = null;
  }
  return proxyAgent;
}

/** Node fetch 注入 undici Dispatcher；直连时返回空对象。 */
export function getGoogleProxyFetchInit(): { dispatcher?: Dispatcher } {
  if (!shouldUseGoogleProxy()) return {};
  const agent = getProxyAgent();
  if (!agent) return {};
  return { dispatcher: agent };
}

/** 环境变量里是否「声明了」代理 URL（不论是否启用）。用于提示文案。 */
export function isGoogleProxyUrlDeclared(): boolean {
  return Boolean(resolveGoogleProxyUrl());
}
