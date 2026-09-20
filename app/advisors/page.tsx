'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdvisorCard from '@/components/AdvisorCard';
import { ButtonLink } from '@/components/ui/button-link';
import { getMentors, type AuthUser } from '@/lib/auth';
import { DEFAULT_SESSIONS, type Advisor } from '@/lib/data';
import { cn } from '@/lib/utils';

const FILTERS = [
  { label: 'All',                   value: '' },
  { label: 'Ivy League',            value: 'ivy',    match: ['Harvard', 'Yale', 'Princeton', 'Columbia', 'Pennsylvania', 'Brown', 'Dartmouth', 'Cornell'] },
  { label: 'Stanford / MIT / CMU',  value: 'elite',  match: ['Stanford', 'MIT', 'Carnegie Mellon'] },
  { label: 'UC System',             value: 'uc',     match: ['UC Berkeley', 'UCLA', 'UC San Diego', 'UC Davis', 'UC Santa Barbara'] },
  { label: 'Top 25',                value: 'top25',  match: ['Duke', 'Northwestern', 'Johns Hopkins', 'Georgetown', 'Rice', 'Vanderbilt', 'Notre Dame', 'Washington University', 'NYU', 'Tufts', 'Emory'] },
  { label: 'Public Flagships',      value: 'public', match: ['Michigan', 'Virginia', 'UNC', 'Wisconsin', 'Illinois', 'Texas', 'Georgia Tech', 'Northeastern', 'Boston University', 'Boston College'] },
];

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

export default function AdvisorsPage() {
  const [query, setQuery]     = useState('');
  const [active, setActive]   = useState('');
  const [mentors, setMentors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMentors().then(users => {
      setMentors(users.map(mentorToAdvisor));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let results = mentors;
    if (active) {
      const group = FILTERS.find(f => f.value === active);
      if (group?.match) {
        results = results.filter(a =>
          group.match!.some(m => a.university.includes(m) || a.universityShort.includes(m))
        );
      }
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(a =>
        a.university.toLowerCase().includes(q) ||
        a.universityShort.toLowerCase().includes(q) ||
        a.major.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.activities.some(act => act.toLowerCase().includes(q))
      );
    }
    return results;
  }, [mentors, query, active]);

  const uniCount = new Set(mentors.map(a => a.university)).size;

  return (
    <div>
      <div className="border-b border-border bg-muted/30 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Advisors</p>
          <h1 className="text-3xl font-bold tracking-tight">Find an Advisor</h1>
          <p className="mt-2 text-muted-foreground">
            {loading
              ? 'Loading advisors…'
              : mentors.length === 0
                ? 'Advisors joining soon — be the first to volunteer'
                : `${mentors.length} volunteer advisor${mentors.length !== 1 ? 's' : ''} across ${uniCount} universit${uniCount !== 1 ? 'ies' : 'y'} — all free`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by university, major, activity, or name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActive(prev => prev === f.value ? '' : f.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium border transition-all',
                active === f.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            <p className="text-sm text-muted-foreground">Loading advisors…</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> advisor{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(advisor => <AdvisorCard key={advisor.id} advisor={advisor} />)}
            </div>
          </>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">No advisors yet</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                We&apos;re onboarding our first advisors. If you were recently admitted to a top university, we&apos;d love to have you!
              </p>
            </div>
            <ButtonLink href="/signup">Become a volunteer advisor</ButtonLink>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Search className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">No advisors match your search</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear your filters</p>
            </div>
            <button onClick={() => { setQuery(''); setActive(''); }} className="text-sm text-primary underline underline-offset-2">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}
