'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, MessageSquarePlus, ThumbsUp, Send,
  CheckCircle2, Loader2, Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CATEGORY_META, submitQuestion, answerQuestion, subscribeToAdvisorQA,
  type QACategory, type QASubmission,
} from '@/lib/qa';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES: Array<{ value: QACategory | 'all'; label: string }> = [
  { value: 'all',             label: 'All'              },
  { value: 'essay',           label: 'Essay Advice'     },
  { value: 'major',           label: 'Major & School'   },
  { value: 'interview',       label: 'Interview Prep'   },
  { value: 'activities',      label: 'Activities'       },
  { value: 'school-specific', label: 'School Deep Dive' },
  { value: 'general',         label: 'General'          },
];

function CategoryBadge({ category }: { category: QACategory }) {
  const m = CATEGORY_META[category];
  return (
    <span style={{ backgroundColor: m.bg, color: m.text }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
      {m.label}
    </span>
  );
}

function AnsweredEntry({ entry }: { entry: QASubmission & { answer: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={entry.category} />
            {entry.helpful > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" /> {entry.helpful} found helpful
              </span>
            )}
          </div>
          <p className="font-medium text-sm text-foreground leading-snug">{entry.question}</p>
          {!open && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {entry.answer}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-0.5 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{entry.answer}</p>
          {entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.map(t => (
                <span key={t} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
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

function PendingEntry({
  sub, isAdvisor,
}: {
  sub: QASubmission;
  isAdvisor: boolean;
}) {
  const [answerMode, setAnswerMode] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    await answerQuestion(sub.id, answerText.trim());
    setSubmitting(false);
    setAnswerMode(false);
    setAnswerText('');
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <CategoryBadge category={sub.category} />
        <span className="text-xs text-muted-foreground">Awaiting response</span>
      </div>
      <p className="text-sm font-medium text-foreground">{sub.question}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isAdvisor ? `Asked by ${sub.studentName}` : 'Asked by you'} ·{' '}
        {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>

      {isAdvisor && (
        answerMode ? (
          <form onSubmit={handleAnswer} className="mt-3 flex flex-col gap-2">
            <textarea
              required
              rows={4}
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Write your answer here…"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setAnswerMode(false); setAnswerText(''); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!answerText.trim() || submitting}>
                {submitting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <><Send className="h-3.5 w-3.5 mr-1.5" /> Post answer</>
                }
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAnswerMode(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Reply className="h-3.5 w-3.5" /> Answer this question
          </button>
        )
      )}
    </div>
  );
}

type Props = {
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
};

export default function QAThread({ advisorId, advisorName, advisorUniversityShort }: Props) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<QASubmission[]>([]);
  const [filter, setFilter]     = useState<QACategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<QACategory>('essay');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    if (!user) { setSubmissions([]); return; }
    const unsub = subscribeToAdvisorQA(advisorId, setSubmissions);
    return unsub;
  }, [advisorId, user?.id]);

  const isAdvisor = user?.id === advisorId;

  const answered = submissions.filter(
    s => s.status === 'answered' && (filter === 'all' || s.category === filter)
  ) as Array<QASubmission & { answer: string }>;

  const pending = submissions.filter(
    s => s.status === 'pending'
      && (filter === 'all' || s.category === filter)
      && (isAdvisor || s.studentId === user?.id)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !user) return;
    setSending(true);
    await submitQuestion({
      advisorId,
      advisorName,
      advisorUniversityShort,
      studentId: user.id,
      studentName: user.name,
      category,
      question: question.trim(),
    });
    setSending(false);
    setQuestion('');
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2500);
  }

  const firstName = advisorName.split(' ')[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-semibold text-base">Community Q&A</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {answered.length} answered question{answered.length !== 1 ? 's' : ''} · ask {firstName} anything
          </p>
        </div>
        {/* Students can ask questions; advisors don't ask themselves */}
        {user && !isAdvisor && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(o => !o)} className="gap-1.5">
            <MessageSquarePlus className="h-4 w-4" />
            Ask a question
          </Button>
        )}
        {!user && (
          <p className="text-xs text-muted-foreground">Sign in to ask a question</p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              filter === c.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Ask form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          {submitted ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium py-2">
              <CheckCircle2 className="h-4 w-4" />
              Question submitted — {firstName} will respond soon
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value as QACategory)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                        category === c.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Your question</label>
                <textarea
                  required
                  rows={3}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder={`e.g. What was the hardest part of the ${advisorUniversityShort} essay process?`}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="gap-1.5" disabled={!question.trim() || sending}>
                  {sending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <><Send className="h-3.5 w-3.5" /> Submit question</>
                  }
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Q&A entries */}
      {!user ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 py-10 text-center">
          <p className="text-sm text-muted-foreground">Sign in to view and ask questions.</p>
        </div>
      ) : answered.length === 0 && pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 py-10 text-center">
          <p className="text-sm text-muted-foreground">No Q&A in this category yet.</p>
          <button onClick={() => setFilter('all')} className="mt-1 text-xs text-primary underline underline-offset-2">
            View all questions
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {answered.map(e => <AnsweredEntry key={e.id} entry={e} />)}
          {pending.map(s => <PendingEntry key={s.id} sub={s} isAdvisor={isAdvisor} />)}
        </div>
      )}
    </div>
  );
}
