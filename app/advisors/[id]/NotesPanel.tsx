'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, StickyNote, Target, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Goal = { id: string; text: string; done: boolean };
type Tab = 'notes' | 'goals';

function storageKey(type: string, advisorId: string) {
  return `ap_${type}_${advisorId}`;
}

export default function NotesPanel({ advisorId, advisorFirstName }: { advisorId: string; advisorFirstName: string }) {
  const [tab, setTab] = useState<Tab>('notes');
  const [notes, setNotes] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(storageKey('notes', advisorId)) ?? '';
    const savedGoals = JSON.parse(localStorage.getItem(storageKey('goals', advisorId)) ?? '[]') as Goal[];
    setNotes(savedNotes);
    setGoals(savedGoals);
  }, [advisorId]);

  function handleNotesChange(val: string) {
    setNotes(val);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey('notes', advisorId), val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  function addGoal() {
    const text = newGoal.trim();
    if (!text) return;
    const updated = [...goals, { id: Date.now().toString(), text, done: false }];
    setGoals(updated);
    localStorage.setItem(storageKey('goals', advisorId), JSON.stringify(updated));
    setNewGoal('');
  }

  function toggleGoal(id: string) {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    localStorage.setItem(storageKey('goals', advisorId), JSON.stringify(updated));
  }

  function removeGoal(id: string) {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem(storageKey('goals', advisorId), JSON.stringify(updated));
  }

  const doneCount = goals.filter(g => g.done).length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {(['notes', 'goals'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              tab === t
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'notes' ? <StickyNote className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            {t === 'notes' ? 'Session Notes' : `Goals ${goals.length > 0 ? `(${doneCount}/${goals.length})` : ''}`}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'notes' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Notes are saved privately in your browser — only you can see them.
              </p>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>
            <textarea
              rows={8}
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder={`Jot down takeaways from your session with ${advisorFirstName}, questions to ask, key advice you received…`}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring leading-relaxed"
            />
          </div>
        )}

        {tab === 'goals' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Set goals for your sessions with {advisorFirstName}. Check them off as you go.
            </p>

            {/* Add goal */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addGoal(); }}
                placeholder="Add a goal (press Enter)"
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button size="sm" onClick={addGoal} disabled={!newGoal.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Goal list */}
            {goals.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Target className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No goals yet. Add one above.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {goals.map(goal => (
                  <li
                    key={goal.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5 group"
                  >
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {goal.done
                        ? <CheckCircle2 className="h-5 w-5 text-primary" />
                        : <Circle className="h-5 w-5" />
                      }
                    </button>
                    <span className={cn('flex-1 text-sm', goal.done && 'line-through text-muted-foreground')}>
                      {goal.text}
                    </span>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {goals.length > 0 && doneCount === goals.length && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
                <p className="text-sm font-medium text-emerald-700">All goals complete!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
