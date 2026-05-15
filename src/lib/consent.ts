export const CONSENT_POLICY_VERSION = "pm-2026-05-14";

export type LegalBasis =
  | "public_business_contact"
  | "event_business_card"
  | "contract_counterparty"
  | "explicit_opt_in"
  | "other_internal_policy";

export const LEGAL_BASIS_LABELS: Record<LegalBasis, string> = {
  public_business_contact: "官网/公开渠道的商业联系方式",
  event_business_card: "展会或商务场合交换名片/明确商务意向",
  contract_counterparty: "合同/订单相对方或授权联系人",
  explicit_opt_in: "对方明确同意接收营销邮件",
  other_internal_policy: "其他（已按我司合规政策评估）",
};
