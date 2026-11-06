// Currencies a project can be kept in. The general (unfiled) ledger is always TWD.
export const DEFAULT_CURRENCY = "TWD";

export const CURRENCIES = [
  { code: "TWD", label: "新台幣" },
  { code: "USD", label: "美元" },
  { code: "JPY", label: "日圓" },
  { code: "KRW", label: "韓元" },
  { code: "CNY", label: "人民幣" },
  { code: "HKD", label: "港幣" },
  { code: "MOP", label: "澳門幣" },
  { code: "SGD", label: "新加坡幣" },
  { code: "MYR", label: "馬來西亞令吉" },
  { code: "IDR", label: "印尼盾" },
  { code: "THB", label: "泰銖" },
  { code: "VND", label: "越南盾" },
  { code: "PHP", label: "菲律賓披索" },
  { code: "EUR", label: "歐元" },
  { code: "GBP", label: "英鎊" },
  { code: "AUD", label: "澳幣" },
  { code: "NZD", label: "紐幣" },
  { code: "CAD", label: "加幣" },
] as const;

export const CURRENCY_CODES: readonly string[] = CURRENCIES.map((c) => c.code);

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === "string" && CURRENCY_CODES.includes(value);
}

/** The currency a ledger records in: the project's own, or TWD for the general ledger. */
export function ledgerCurrency(project: { currency?: string } | null | undefined): string {
  return project?.currency || DEFAULT_CURRENCY;
}
