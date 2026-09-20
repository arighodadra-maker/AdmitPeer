'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Star, School, CheckCircle2, History, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button-link';
import { useAuth } from '@/contexts/AuthContext';
import { getMentors, type AuthUser } from '@/lib/auth';
import { universities, DEFAULT_SESSIONS, type Advisor } from '@/lib/data';
import { saveMatchSession, getMatchHistory, type MatchHistoryEntry } from '@/lib/matchHistory';
import { cn } from '@/lib/utils';

// ── Convert Firestore mentor to Advisor ───────────────────────────────────────
function mentorToAdvisor(u: AuthUser): Advisor {
  const initials = u.initials ?? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: u.id,
    name: u.name,
    initials,
    avatarColor: u.avatarColor ?? 'bg-violet-500',
    university: u.university ?? '',
    universityShort: u.universityShort ?? '',
    major: u.major ?? '',
    graduationYear: u.graduationYear ?? new Date().getFullYear() + 2,
    highSchool: u.highSchool ?? '',
    location: '',
    gpa: '',
    sat: 0,
    activities: u.activities ?? [],
    bio: u.bio ?? '',
    sessions: u.sessions ?? DEFAULT_SESSIONS,
    rating: u.rating ?? 5.0,
    totalSessions: u.totalSessions ?? 0,
    tags: u.tags ?? [],
    featured: u.featured ?? false,
  };
}

const INTERESTS = [
  { label: 'Computer Science & Tech',    tags: ['CS', 'STEM', 'Competitive Programming', 'Open Source', 'Tech Career', 'Builders', 'Co-op', 'Fintech'] },
  { label: 'Pre-Med & Health',           tags: ['Pre-Med', 'Biology', 'Neuroscience', 'Health', 'Biomedical Engineering', 'Research'] },
  { label: 'Business & Finance',         tags: ['Business', 'Finance', 'Wharton', 'Pre-Business', 'DECA', 'Entrepreneurship'] },
  { label: 'Engineering',                tags: ['Engineering', 'Aerospace', 'Robotics', 'Bioengineering'] },
  { label: 'Humanities & Social Sci.',   tags: ['Humanities', 'Political Science', 'Government', 'Debate', 'Writing'] },
  { label: 'Arts & Film',                tags: ['Film', 'Arts', 'Creative Writing', 'Theater', 'Creative'] },
  { label: 'Journalism & Media',         tags: ['Journalism', 'Media'] },
  { label: 'Law & Policy',               tags: ['Pre-Law', 'Policy', 'Pre-Diplomacy', 'International Relations', 'SFS'] },
  { label: 'Environment',                tags: ['Environment', 'Outdoors', 'Community'] },
  { label: 'Public Health & Service',    tags: ['Public Health', 'Community Impact', 'Scholars'] },
  { label: 'Liberal Arts',               tags: ['Liberal Arts', 'Open Curriculum', 'Small School'] },
  { label: 'First-Gen Student',          tags: ['First-Gen'] },
  { label: 'Athletics',                  tags: ['Athletics'] },
  { label: 'Research & Academia',        tags: ['Research', 'Science', 'Science Olympiad'] },
  { label: 'Languages & Global Studies', tags: ['Languages', 'International Relations'] },
];

// ── Matching ──────────────────────────────────────────────────────────────────
type MatchResult = { advisor: Advisor; score: number; reasons: string[] };

function matchAdvisors(colleges: string[], interests: string[], advisors: Advisor[]): MatchResult[] {
  const selectedTags = new Set(
    interests.flatMap(i => INTERESTS.find(g => g.label === i)?.tags ?? [])
  );

  return advisors
    .map(advisor => {
      let score = 0;
      const reasons: string[] = [];

      if (colleges.includes(advisor.university)) {
        score += 20;
        reasons.push(`Admitted to ${advisor.universityShort}`);
      }

      for (const tag of advisor.tags) {
        if (selectedTags.has(tag)) { score += 5; reasons.push(tag); }
      }

      let actMatches = 0;
      for (const activity of advisor.activities) {
        if (actMatches >= 3) break;
        const actLower = activity.toLowerCase();
        for (const interest of interests) {
          const keyword = interest.split(' ')[0].toLowerCase();
          if (keyword.length > 3 && actLower.includes(keyword)) { score += 2; actMatches++; break; }
        }
      }

      score += advisor.rating * 0.5;
      score += Math.min(advisor.totalSessions * 0.05, 2);

      return { advisor, score, reasons: [...new Set(reasons)] };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ── Step header ───────────────────────────────────────────────────────────────
function StepHeader({ step }: { step: number }) {
  const steps = ['Dream Schools', 'Interests', 'Your Matches'];
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all',
                done ? 'bg-primary text-primary-foreground' :
                current ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                          'bg-muted text-muted-foreground'
              )}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span className={cn('text-sm font-medium hidden sm:block', current ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-1 h-px w-8 transition-colors', done ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
          : 'border-border bg-background text-foreground hover:border-primary/60 hover:bg-accent'
      )}
    >
      {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
      {label}
    </button>
  );
}

function MatchCard({ result }: { result: MatchResult }) {
  const { advisor, score, reasons } = result;
  const maxScore = 20 + INTERESTS.length * 5 + 3 * 2 + 5;
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  const strength = pct >= 55 ? 'Strong match' : pct >= 30 ? 'Good match' : 'Partial match';
  const strengthColor = pct >= 55 ? 'text-emerald-600' : pct >= 30 ? 'text-primary' : 'text-amber-600';

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`h-1.5 w-full ${advisor.avatarColor}`} />
      <div className="flex flex-1 flex-col p-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className={cn('text-xs font-bold shrink-0', strengthColor)}>{strength}</span>
        </div>

        <div className="flex items-start gap-3">
          <Avatar className="h-13 w-13 shrink-0 ring-2 ring-background shadow-sm">
            <AvatarFallback className={`${advisor.avatarColor} text-white text-sm font-bold`}>
              {advisor.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">{advisor.name}</p>
            <p className="text-xs text-muted-foreground truncate">{advisor.major}</p>
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {advisor.universityShort}
            </span>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shrink-0">Free</span>
        </div>

        {advisor.highSchool && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 min-w-0">
              <School className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{advisor.highSchool}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0 ml-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{advisor.rating.toFixed(1)}</span>
            </span>
          </div>
        )}

        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reasons.slice(0, 4).map(r => (
              <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <CheckCircle2 className="h-3 w-3" /> {r}
              </span>
            ))}
          </div>
        )}

        <ButtonLink href={`/advisors/${advisor.id}`} className="w-full justify-center mt-auto" size="sm">
          View Profile & Schedule
        </ButtonLink>
      </div>
    </div>
  );
}

function RecentHistory({ onRestore }: { onRestore: (entry: MatchHistoryEntry) => void }) {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { setHistory(getMatchHistory()); }, []);
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4 mb-6">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Recent searches ({history.length})
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {history.slice(0, 5).map(entry => (
            <button
              key={entry.id}
              onClick={() => onRestore(entry)}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-left hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <div>
                <p className="text-sm font-medium">
                  {entry.colleges.slice(0, 2).join(', ')}{entry.colleges.length > 2 ? ` +${entry.colleges.length - 2}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.interests.length} interest{entry.interests.length !== 1 ? 's' : ''} · {new Date(entry.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className="text-xs font-medium text-primary">{entry.topAdvisorIds.length} matches →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const { user } = useAuth();
  const [step, setStep]           = useState(1);
  const [colleges, setColleges]   = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [advisors, setAdvisors]   = useState<Advisor[]>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);

  // Load mentors from Firestore
  useEffect(() => {
    getMentors().then(users => {
      setAdvisors(users.map(mentorToAdvisor));
      setLoadingAdvisors(false);
    });
  }, []);

  // Pre-populate dream colleges from user profile
  useEffect(() => {
    if (user?.dreamColleges?.length && colleges.length === 0) {
      setColleges(user.dreamColleges);
    }
  }, [user]);

  function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  const matches = useMemo(() => matchAdvisors(colleges, interests, advisors), [colleges, interests, advisors]);

  function goToResults() {
    setStep(3);
    saveMatchSession({
      id: `match-${Date.now()}`,
      colleges,
      interests,
      topAdvisorIds: matches.slice(0, 5).map(r => r.advisor.id),
      savedAt: new Date().toISOString(),
    });
  }

  function restoreSearch(entry: MatchHistoryEntry) {
    setColleges(entry.colleges);
    setInterests(entry.interests);
    setStep(3);
  }

  return (
    <div>
      <div className="border-b border-border bg-muted/30 px-4 py-10 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Find your perfect match</h1>
          <p className="mt-2 text-muted-foreground">Tell us your dream schools and interests — we&apos;ll rank advisors who fit.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <StepHeader step={step} />

        {/* ── Step 1: Colleges ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <RecentHistory onRestore={restoreSearch} />
            {user?.dreamColleges?.length ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                We pre-selected your dream schools from your profile. Adjust as needed.
              </div>
            ) : null}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">Which college(s) are you targeting?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select as many as you like.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {universities.map(u => (
                <Chip key={u} label={u} selected={colleges.includes(u)} onClick={() => toggle(colleges, u, setColleges)} />
              ))}
            </div>
            {colleges.length > 0 && (
              <p className="text-sm text-muted-foreground">{colleges.length} school{colleges.length !== 1 ? 's' : ''} selected</p>
            )}
            <div className="flex justify-end pt-2">
              <Button size="lg" onClick={() => setStep(2)} disabled={colleges.length === 0}>
                Next — Pick Interests <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Interests ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">What are your interests?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select everything that applies to you.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <Chip key={i.label} label={i.label} selected={interests.includes(i.label)} onClick={() => toggle(interests, i.label, setInterests)} />
              ))}
            </div>
            {interests.length > 0 && (
              <p className="text-sm text-muted-foreground">{interests.length} interest{interests.length !== 1 ? 's' : ''} selected</p>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={goToResults} disabled={interests.length === 0}>
                See My Matches <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {loadingAdvisors ? 'Finding matches…' : matches.length > 0
                      ? `${matches.length} advisor${matches.length !== 1 ? 's' : ''} matched`
                      : 'No exact matches yet'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {colleges.map(c => <span key={c} className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{c}</span>)}
                    {interests.map(i => <span key={i} className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">{i}</span>)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)} className="shrink-0">Start over</Button>
              </div>
            </div>

            {loadingAdvisors ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : matches.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {matches.map(r => <MatchCard key={r.advisor.id} result={r} />)}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <p className="font-semibold">No exact matches yet</p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                      We&apos;re adding new advisors every week. Try broadening your school list or browse all advisors.
                    </p>
                  </div>
                  <ButtonLink href="/advisors" variant="outline">Browse all advisors</ButtonLink>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
