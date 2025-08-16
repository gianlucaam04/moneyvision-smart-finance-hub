import { useState, useCallback } from 'react';

export type MonthlyInsightsInput = {
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  topCategories: Array<{ name: string; value: number }>;
  overBudgetCategories: Array<{ name: string; spent: number; budget: number }>;
  recurringExpenses: Array<{ date: string; description?: string; category: string; amount: number }>;
};

export type MonthlyInsightsJSON = {
  month: string;
  totals: { income: number; expenses: number; netIncome: number };
  topCategories: Array<{ name: string; value: number }>;
  overBudget: Array<{ name: string; spent: number; budget: number; overPct?: number; tip?: string }>;
  anomalies?: Array<string>;
  suggestions?: Array<{ title?: string; text: string; priority?: string; impactEUR?: number; evidence?: string }>;
  actions?: Array<{ title?: string; text: string; priority?: string; impactEUR?: number; evidence?: string }>;
};

export function useMonthlyInsights() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightsJson, setInsightsJson] = useState<MonthlyInsightsJSON | null>(null);

  const generate = useCallback(async (data: MonthlyInsightsInput) => {
    setLoading(true);
    setError(null);
    setInsights('');
    setInsightsJson(null);

    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY as string | undefined;
    const model = (import.meta.env.VITE_TOGETHER_MODEL as string | undefined) || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';

    if (!apiKey) {
      setError('API key Together AI mancante. Configura VITE_TOGETHER_API_KEY.');
      setLoading(false);
      return;
    }

    const systemPrompt = `Sei un assistente finanziario critico e pragmatico.
Restituisci SOLO un JSON valido conforme allo schema indicato nelle istruzioni, senza testo aggiuntivo.
Regole strette output:
- NON includere chiavi extra non previste dallo schema (es. 'schema', 'instruction', 'note').
- Usa solo le chiavi: month, totals, topCategories, overBudget, anomalies, suggestions, actions.
- Se un campo opzionale è assente, omettilo o usa array vuoti.
Linee guida analitiche:
- Basi l'analisi sulle ENTRATE del mese indicato e dai consigli per i prossimi 30-90 giorni.
- Non ripetere totali già visibili in UI: concentrati su diagnosi sprechi/anomalie e azioni correttive SMART.
- Fornisci impactEUR stimato e evidence sintetica per suggerimenti/azioni.
- Usa EUR e numeri (niente simboli) nei campi numerici. Nessuna spiegazione fuori dal JSON.`;

    const userPrompt = {
      month: data.monthLabel,
      totals: {
        income: data.totalIncome,
        expenses: data.totalExpenses,
        netIncome: data.netIncome,
      },
      topCategories: data.topCategories.filter(c => c.value > 0).slice(0, 6),
      overBudget: data.overBudgetCategories.map(o => ({
        name: o.name,
        spent: o.spent,
        budget: o.budget,
        overPct: o.budget > 0 ? Number((((o.spent - o.budget) / o.budget) * 100).toFixed(1)) : 0,
      })),
      recurring: data.recurringExpenses.slice(0, 10),
      instruction: 'Schema atteso (NON includere questa chiave nello stesso JSON di output): {"month": string, "totals": {"income": number, "expenses": number, "netIncome": number}, "topCategories": [{"name": string, "value": number}][], "overBudget": [{"name": string, "spent": number, "budget": number, "overPct"?: number, "tip"?: string}][], "anomalies"?: string[], "suggestions"?: [{"title"?: string, "text": string, "priority"?: string, "impactEUR"?: number, "evidence"?: string}][], "actions"?: [{"title"?: string, "text": string, "priority"?: string, "impactEUR"?: number, "evidence"?: string}][]}. Restituisci SOLO il JSON, senza campi extra come schema o instruction. Fornisci 3-5 suggerimenti e 3-5 azioni SMART con impactEUR ed evidence.'
    };

    try {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Dati mese (JSON): ${JSON.stringify(userPrompt)}` },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content || '';
      setInsights(content);
      // Prova un parse robusto: rimuovi code fences Markdown e prova vari fallback
      const stripFences = (s: string) => {
        let out = s.trim();
        // Rimuove ```json ... ``` o ``` ... ```
        if (out.startsWith('```')) {
          out = out.replace(/^```json\s*[\r\n]?/i, '').replace(/^```\s*[\r\n]?/i, '');
        }
        out = out.replace(/```\s*$/m, '');
        return out.trim();
      };
      const tryParse = (s: string): unknown | null => {
        try { return JSON.parse(s); } catch { return null; }
      };
      const extractFirstJsonObject = (s: string): string | null => {
        const start = s.indexOf('{');
        if (start === -1) return null;
        let depth = 0;
        for (let i = start; i < s.length; i++) {
          const ch = s[i];
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) return s.slice(start, i + 1);
          }
        }
        return null;
      };
      const pre = stripFences(content);
      let parsed: unknown = tryParse(pre);
      if (!parsed) {
        const candidate = extractFirstJsonObject(pre);
        if (candidate) parsed = tryParse(candidate);
      }
      if (!parsed) {
        // Fallback: prendi dal primo '{' all'ultimo '}' e prova a fare parse
        const first = pre.indexOf('{');
        const last = pre.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          const slice = pre.slice(first, last + 1);
          parsed = tryParse(slice);
        }
      }
      if (parsed && typeof parsed === 'object') {
        // Sanificazione: rimuovi chiavi indesiderate e applica default
        const obj = parsed as Record<string, unknown>;
        if ('schema' in obj) delete (obj as { [k: string]: unknown }).schema;
        const ensureArray = <T = unknown>(v: unknown): T[] | undefined => Array.isArray(v) ? (v as T[]) : undefined;
        const top = ensureArray<{ name: string; value: number }>(obj.topCategories);
        const over = ensureArray<{ name: string; spent: number; budget: number; overPct?: number; tip?: string }>(obj.overBudget);
        const anomalies = ensureArray<string>(obj.anomalies);
        const suggestions = ensureArray<{ title?: string; text: string; priority?: string; impactEUR?: number; evidence?: string }>(obj.suggestions);
        const actions = ensureArray<{ title?: string; text: string; priority?: string; impactEUR?: number; evidence?: string }>(obj.actions);
        (obj as any).topCategories = top ?? [];
        (obj as any).overBudget = over ?? [];
        if (obj.anomalies !== undefined) (obj as any).anomalies = anomalies ?? undefined;
        if (obj.suggestions !== undefined) (obj as any).suggestions = suggestions ?? undefined;
        if (obj.actions !== undefined) (obj as any).actions = actions ?? undefined;
        setInsightsJson(obj as MonthlyInsightsJSON);
      }
    } catch (e: unknown) {
      const message = typeof e === 'object' && e && 'message' in e ? String((e as any).message) : 'Errore nella generazione degli insights';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, insightsJson, loading, error, generate };
}
