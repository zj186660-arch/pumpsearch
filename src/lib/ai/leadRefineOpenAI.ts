import { abortSignalAfter } from "../net/abortSignalAfter";
import { formatFetchError } from "../net/fetchErrors";
import type { LeadRow } from "../leads";

function maxRefine(): number {
  const v = process.env.OPENAI_REFINE_MAX;
  const n = v ? parseInt(v, 10) : 10;
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 25) : 10;
}

/**
 * 可选：用 OpenAI 从标题/URL/摘要推断公司展示名、国家猜测、中文一行简介、产品词。
 * 未配置 OPENAI_API_KEY 时直接原样返回。
 */
export async function refineLeadsWithOpenAI(leads: LeadRow[]): Promise<LeadRow[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || leads.length === 0) return leads;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const cap = maxRefine();
  if (cap === 0) return leads;

  const head = leads.slice(0, cap);
  const tail = leads.slice(cap);
  const refined: LeadRow[] = [];

  for (let i = 0; i < head.length; i += 3) {
    const chunk = head.slice(i, i + 3);
    const part = await Promise.all(chunk.map((l) => refineOneLead(l, key, model)));
    refined.push(...part);
  }

  return [...refined, ...tail];
}

type AiExtract = {
  company_name?: string;
  country_guess?: string;
  description_zh?: string;
  products?: string[];
};

async function refineOneLead(lead: LeadRow, apiKey: string, model: string): Promise<LeadRow> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      signal: abortSignalAfter(45_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是 B2B 水泵外贸线索清洗助手。根据网页搜索结果的标题、URL、摘要，抽取结构化信息。只输出合法 JSON，键：company_name（简短公司名）, country_guess（国家，中文或英文）, description_zh（一行中文业务描述，≤120字）, products（字符串数组，最多5个水泵相关产品词，不确定则空数组）。不要编造具体联系人邮箱电话。",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: lead.name,
              url: lead.website,
              snippet: lead.description,
            }),
          },
        ],
      }),
    });

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (!res.ok || json.error) {
      return lead;
    }
    const text = json.choices?.[0]?.message?.content;
    if (!text) return lead;
    const parsed = JSON.parse(text) as AiExtract;
    const name = parsed.company_name?.trim();
    const country = parsed.country_guess?.trim();
    const desc = parsed.description_zh?.trim();
    const products = Array.isArray(parsed.products) ? parsed.products.map((x) => String(x).trim()).filter(Boolean).slice(0, 5) : [];

    return {
      ...lead,
      name: name && name.length > 1 ? name.slice(0, 200) : lead.name,
      country: country && country.length > 0 ? country.slice(0, 80) : lead.country,
      description: desc && desc.length > 0 ? desc.slice(0, 500) : lead.description,
      products: products.length > 0 ? products : (lead.products ?? []),
      signals: [...(lead.signals ?? []), `OpenAI 清洗 · ${model}`],
    };
  } catch (e) {
    return {
      ...lead,
      signals: [...(lead.signals ?? []), `OpenAI 清洗跳过：${formatFetchError(e)}`],
    };
  }
}
