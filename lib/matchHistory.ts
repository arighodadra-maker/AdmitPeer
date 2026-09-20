export type MatchHistoryEntry = {
  id: string;
  colleges: string[];
  interests: string[];
  topAdvisorIds: string[];
  savedAt: string;
};

const KEY = 'ap_match_history';

export function getMatchHistory(): MatchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as MatchHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveMatchSession(entry: MatchHistoryEntry): void {
  const updated = [entry, ...getMatchHistory()].slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearMatchHistory(): void {
  localStorage.removeItem(KEY);
}
