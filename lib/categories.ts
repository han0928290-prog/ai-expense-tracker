export const CATEGORIES = [
  "飲食",
  "交通",
  "娛樂",
  "購物",
  "居家",
  "醫療",
  "教育",
  "其他",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Fixed categorical hue order (validated colorblind-safe palette) — never cycled or reassigned.
// Values reference CSS custom properties (app/globals.css) that already swap per color scheme,
// so callers get theme-correct colors via plain inline styles instead of dynamically built
// Tailwind class names (which the JIT compiler can't statically discover and would silently drop).
const CATEGORY_COLOR_VAR: Record<Category, string> = {
  飲食: "var(--series-1)",
  交通: "var(--series-2)",
  娛樂: "var(--series-3)",
  購物: "var(--series-4)",
  居家: "var(--series-5)",
  醫療: "var(--series-6)",
  教育: "var(--series-7)",
  其他: "var(--series-8)",
};

export function getCategoryColorVar(category: string): string {
  return CATEGORY_COLOR_VAR[category as Category] ?? CATEGORY_COLOR_VAR.其他;
}

export const DEFAULT_TREND_COLOR_VAR = CATEGORY_COLOR_VAR.飲食;
export const ALL_CATEGORY = "all";
