import OpenAI from "openai";
import { CATEGORIES } from "@/lib/categories";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExpenseItem {
  amount: number;
  currency: string;
  category: string;
  item: string;
  merchant: string;
  date: string;
  note: string;
  confidence: number;
}

export interface ExpenseAnalysisResult {
  summary: string;
  expenses: ExpenseItem[];
}

const TIME_ZONE = "Asia/Taipei";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date as YYYY-MM-DD in Taiwan time (the server may run in UTC). */
function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/**
 * The model tends to fill in a stale year (e.g. 2023) when the text only says "11/4".
 * Unless the text names that year, re-pick the year closest to today for that month/day.
 */
function normalizeDate(date: unknown, text: string, today: string): string {
  if (typeof date !== "string" || !DATE_KEY_PATTERN.test(date)) return today;

  const year = date.slice(0, 4);
  if (text.includes(year)) return date;

  const monthDay = date.slice(5);
  const thisYear = Number(today.slice(0, 4));
  const dayMs = (key: string) => Date.parse(`${key}T00:00:00Z`);
  const candidates = [thisYear - 1, thisYear, thisYear + 1]
    .map((y) => `${y}-${monthDay}`)
    .filter((key) => !Number.isNaN(dayMs(key)));
  if (candidates.length === 0) return today;

  return candidates.reduce((best, key) =>
    Math.abs(dayMs(key) - dayMs(today)) < Math.abs(dayMs(best) - dayMs(today)) ? key : best
  );
}

/**
 * `currency` is the ledger's currency (the project's, or TWD for the general ledger).
 * Every entry is recorded in it, so a ledger's totals never mix currencies.
 */
export async function analyzeExpenseText(
  text: string,
  currency: string
): Promise<ExpenseAnalysisResult> {
  const today = todayKey();
  const weekday = new Intl.DateTimeFormat("zh-TW", { timeZone: TIME_ZONE, weekday: "long" }).format(
    new Date()
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `你是記帳助理。使用者會用一段話描述一筆或多筆花費，你要把每一筆花費都拆解出來。
只能回傳 JSON 物件，格式如下：
{
  "summary": string,   // 用一句話總結這次解析出幾筆支出、各花了多少錢
  "expenses": [
    {
      "amount": number,      // 金額，純數字，不含幣別符號，以 ${currency} 計
      "category": string,    // 從以下分類擇一：${CATEGORIES.join("、")}
      "item": string,        // 這筆支出的簡短標題，可視情況加上時段/情境（例如「午餐 牛肉麵」「打保齡球」）
      "merchant": string,    // 店家或消費場所，若文字中沒有明確提及就用合理推測的場所類型，完全無法推測則回傳空字串
      "date": string,        // 日期，格式 YYYY-MM-DD，未提及則使用今天日期 ${today}；只寫月/日時年份用 ${today.slice(0, 4)}
      "note": string,        // 其他補充說明，沒有則為空字串
      "confidence": number   // 你對這筆解析結果的信心程度，0 到 1 之間的小數
    }
  ]
}
今天是 ${today}（${weekday}）。「昨天」「上週五」這類相對日期請以今天推算；文字前面寫的日期適用於後面同一句裡的所有花費。
一段文字裡可能包含多筆花費，請依照語意切分成多個 expenses 項目，每一筆都要各自估計 confidence。
這本帳的幣別是 ${currency}，所有金額都直接以文字中的數字記錄、視為 ${currency}，不要換算匯率。`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI 未回傳任何內容");
  }

  const parsed = JSON.parse(content) as Partial<ExpenseAnalysisResult>;

  if (!Array.isArray(parsed.expenses) || parsed.expenses.length === 0) {
    throw new Error("OpenAI 回傳結果缺少有效的 expenses");
  }

  const expenses = parsed.expenses.map((raw, index) => {
    const item = raw as Partial<ExpenseItem>;
    if (typeof item.amount !== "number") {
      throw new Error(`OpenAI 回傳的第 ${index + 1} 筆支出缺少有效的 amount`);
    }

    return {
      amount: item.amount,
      currency,
      category: item.category || "其他",
      item: item.item || text.slice(0, 20),
      merchant: item.merchant || "",
      date: normalizeDate(item.date, text, today),
      note: item.note || "",
      confidence: typeof item.confidence === "number" ? item.confidence : 1,
    };
  });

  return {
    summary: parsed.summary || `這次解析出 ${expenses.length} 筆支出。`,
    expenses,
  };
}
