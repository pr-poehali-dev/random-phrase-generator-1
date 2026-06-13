import { useState, useEffect } from "react";
import { PhraseResult } from "@/lib/api";

export interface HistoryItem extends PhraseResult {
  id: string;
  savedAt: string;
}

const STORAGE_KEY = "phrase_history";
const MAX_ITEMS = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(parsed);
    }
  }, []);

  function saveToStorage(items: HistoryItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addToHistory(phrase: PhraseResult) {
    if (!phrase.phrase || phrase.error) return;
    const item: HistoryItem = {
      ...phrase,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      savedAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, MAX_ITEMS);
      saveToStorage(next);
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function removeItem(id: string) {
    setHistory((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage(next);
      return next;
    });
  }

  return { history, addToHistory, clearHistory, removeItem };
}
