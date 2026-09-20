'use client';

import { useState, useMemo } from 'react';
import { Search, ThumbsUp, ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ButtonLink } from '@/components/ui/button-link';
import {
  SEED_QA, CATEGORY_META, searchKB,
  type QACategory, type QAEntry,
} from '@/lib/qa';
import { cn } from '@/lib/utils';

const CATEGORIES: Array<{ value: QACategory | 'all'; label: string }> = [
  { value: 'all',             label: 'All'              },
  { value: 'essay',           label: 'Essay Advice'     },
  { value: 'major',           label: 'Major & School'   },
  { value: 'interview',       label: 'Interview Prep'   },
  { value: 'activities',      label: 'Activities'       },
  { value: 'school-specific', label: 'School Deep Dive' },
  { value: 'general',         label: 'General Advice'   },
];

const STATS = [
  { value: SEED_QA.length.toString(), label: 'questions answered' },
  {
    value: new Set(SEED_QA.map(e => e.advisorId)).size.toString(),
    label: 'advisors contributing',
  },
  { value: '6', label: 'topic categories' },
  {
    value: SEED_QA.reduce((n, e) => n + e.helpful, 0).toLocaleString(),
    label: 'total helpful votes',
  },
];

function CategoryBadge({ category }: { category: QACategory }) {
  const m = CATEGORY_META[category];
  return (
    <span
      style={{ backgroundColor: m.bg, color: m.text }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
    >
      {m.label}
    </span>
  );
}

function AdvisorChip({ entry }: { entry: QAEntry }) {
  const initials = entry.advisorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <ButtonLink
      href={`/advisors/${entry.advisorId}`}
      variant="ghost"
      size="sm"
      className="h-auto px-0 py-0 text-xs text-muted-foreground hover:text-primary gap-1.5"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-violet-500">
        {initials}
      </span>
      {entry.advisorName} · {entry.advisorUniversityShort}
    </ButtonLink>
  );
}

function QACard({ entry }: { entry: QAEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-5 hover:bg-muted/20 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={entry.category} />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" /> {entry.helpful}
          </span>
        </div>
        <p className="font-semibold text-foreground leading-snug mb-2">{entry.question}</p>
        {!open ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {entry.answer}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <AdvisorChip entry={entry} />
          <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {open ? 'Collapse' : 'Read answer'}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 bg-muted/10">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{entry.answer}</p>
          {entry.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {entry.tags.map(t => (
                <span key={t} className="inline-flex rounded-full bg-muted border border-border/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Search className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-semibold">No results for &ldquo;{query}&rdquo;</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Try a different search — school name, topic, or keyword from the answer.
        </p>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [query, setQuery]     = useState('');
  const [category, setCategory] = useState<QACategory | 'all'>('all');

  const results = useMemo(() => searchKB(query, category), [query, category]);

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,92,246,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Knowledge Base</h1>
          <p className="mt-3 text-indigo-200 max-w-xl mx-auto">
            Real questions answered by students who got in. Searchable, categorized, and built from actual advisor conversations.
          </p>
          {/* Search */}
          <div className="relative mt-8 max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder="Search by topic, school, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white text-foreground shadow-lg shadow-black/20 border-0 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {STATS.map(s => (
              <div key={s.label} className="px-5 py-4 text-center first:pl-0 last:pr-0">
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                category === c.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="mb-5 text-sm text-muted-foreground">
          {query.trim() || category !== 'all'
            ? <><span className="font-semibold text-foreground">{results.length}</span> result{results.length !== 1 ? 's' : ''}{query.trim() ? ` for "${query}"` : ''}</>
            : <><span className="font-semibold text-foreground">{results.length}</span> questions answered</>
          }
        </p>

        {/* Results */}
        {results.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map(e => <QACard key={e.id} entry={e} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-border bg-muted/20 px-6 py-10 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="font-semibold text-foreground">Don't see your question?</p>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
            Find the right advisor for your target school and ask them directly. Questions asked publicly get added to this knowledge base.
          </p>
          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <ButtonLink href="/match" size="sm" className="shadow-sm shadow-primary/20">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find my match
            </ButtonLink>
            <ButtonLink href="/advisors" variant="outline" size="sm">
              Browse all advisors
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
