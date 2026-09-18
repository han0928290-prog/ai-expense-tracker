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

export async function analyzeExpenseText(
  text: string
): Promise<ExpenseAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);

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
      "amount": number,      // 金額，純數字，不含幣別符號
      "currency": string,    // 幣別代碼，例如 "TWD"、"USD"，未提及則預設 "TWD"
      "category": string,    // 從以下分類擇一：${CATEGORIES.join("、")}
      "item": string,        // 這筆支出的簡短標題，可視情況加上時段/情境（例如「午餐 牛肉麵」「打保齡球」）
      "merchant": string,    // 店家或消費場所，若文字中沒有明確提及就用合理推測的場所類型，完全無法推測則回傳空字串
      "date": string,        // 日期，格式 YYYY-MM-DD，未提及則使用今天日期 ${today}
      "note": string,        // 其他補充說明，沒有則為空字串
      "confidence": number   // 你對這筆解析結果的信心程度，0 到 1 之間的小數
    }
  ]
}
一段文字裡可能包含多筆花費，請依照語意切分成多個 expenses 項目，每一筆都要各自估計 confidence。`,
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
      currency: item.currency || "TWD",
      category: item.category || "其他",
      item: item.item || text.slice(0, 20),
      merchant: item.merchant || "",
      date: item.date || today,
      note: item.note || "",
      confidence: typeof item.confidence === "number" ? item.confidence : 1,
    };
  });

  return {
    summary: parsed.summary || `這次解析出 ${expenses.length} 筆支出。`,
    expenses,
  };
}
