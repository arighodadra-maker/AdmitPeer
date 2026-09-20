'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock,
  Trash2, Plus, CheckCircle2, Download, Video, Loader2, User,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import UniversityLogo from '@/components/UniversityLogo';
import {
  subscribeToStudentSessions, subscribeToAdvisorSessions, deleteSession,
  type BookedSession,
} from '@/lib/sessions';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLong(iso: string): string {
  return toDate(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatShort(iso: string): string {
  return toDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function downloadICS(session: BookedSession, isAdvisorView: boolean) {
  const [y, m, d] = session.dateISO.split('-').map(Number);
  const timeMatch = session.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hour = timeMatch ? parseInt(timeMatch[1]) : 10;
  const minute = timeMatch ? parseInt(timeMatch[2]) : 0;
  const isPM = timeMatch?.[3]?.toUpperCase() === 'PM';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  const durMatch = session.sessionDuration.match(/(\d+)/);
  const durationMins = durMatch ? parseInt(durMatch[1]) : 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
  const endDate = new Date(y, m - 1, d, hour, minute + durationMins);
  const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const location = session.meetingLink ?? 'To be confirmed';
  const otherParty = isAdvisorView ? session.studentName : session.advisorName;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AdmitPeer//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
    `SUMMARY:AdmitPeer: ${session.sessionType} with ${otherParty}`,
    `DESCRIPTION:${session.goal.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `UID:${session.id}@admitpeer`,
    'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `admitpeer-${otherParty.split(' ')[0].toLowerCase()}-${session.sessionType.split(' ')[0].toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({
  session, currentUserId, onDelete, compact = false,
}: {
  session: BookedSession;
  currentUserId: string;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  const isPast = session.dateISO < todayISO();
  const isAdvisorView = session.advisorId === currentUserId;

  // What to display depends on which side of the session the viewer is on
  const primaryName    = isAdvisorView ? session.studentName : session.advisorName;
  const primarySub     = isAdvisorView ? 'Student' : session.advisorUniversityShort;
  const roleLabel      = isAdvisorView ? 'Mentoring' : null;

  return (
    <div className={cn(
      'rounded-xl border border-border bg-background overflow-hidden transition-opacity',
      isPast && 'opacity-50',
    )}>
      <div className={`h-1 w-full ${session.advisorAvatarColor || 'bg-violet-500'}`} />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {isAdvisorView ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <UniversityLogo university={session.advisorUniversity} size="sm" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{primaryName}</p>
              <p className="text-xs text-primary font-medium">{primarySub}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {roleLabel && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {roleLabel}
              </span>
            )}
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              session.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
              session.status === 'completed' ? 'bg-muted text-muted-foreground' :
              session.status === 'declined'  ? 'bg-destructive/10 text-destructive' :
                                               'bg-amber-100 text-amber-700',
            )}>
              {session.status === 'confirmed' ? 'Confirmed' :
               session.status === 'completed' ? 'Completed' :
               session.status === 'declined'  ? 'Declined'  : 'Pending'}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-foreground">{session.sessionType}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> {formatShort(session.dateISO)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {session.timeSlot} · {session.sessionDuration}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Free</span>
        </div>

        {!compact && session.goal && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border pt-2">
            <span className="font-medium text-foreground">Goal: </span>{session.goal}
          </p>
        )}

        {session.meetingLink && !isPast && session.status === 'confirmed' && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
          >
            <Video className="h-3.5 w-3.5" /> Join meeting room
          </a>
        )}

        <div className="flex gap-2 pt-1">
          {!isAdvisorView && (
            <ButtonLink
              href={`/advisors/${session.advisorId}`}
              variant="outline"
              size="sm"
              className="flex-1 text-xs justify-center"
            >
              View Advisor
            </ButtonLink>
          )}
          {isAdvisorView && (
            <ButtonLink
              href="/dashboard"
              variant="outline"
              size="sm"
              className="flex-1 text-xs justify-center"
            >
              Manage in Dashboard
            </ButtonLink>
          )}
          <button
            onClick={() => downloadICS(session, isAdvisorView)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground"
            title="Export to calendar (.ics)"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {/* Students can cancel their own sessions; advisors manage via dashboard */}
          {!isPast && !isAdvisorView && (
            <button
              onClick={() => onDelete(session.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-colors text-muted-foreground"
              title="Cancel session"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter();
  const { user, loaded } = useAuth();
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [studentSessions, setStudentSessions] = useState<BookedSession[]>([]);
  const [advisorSessions, setAdvisorSessions] = useState<BookedSession[]>([]);
  const [selectedISO, setSelectedISO] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (loaded && !user) { router.push('/login'); return; }
  }, [loaded, user, router]);

  // Student-side sessions (sessions this user booked as a student)
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToStudentSessions(user.id, (s) => {
      setStudentSessions(s);
      setDataLoaded(true);
    });
    return unsub;
  }, [user?.id]);

  // Advisor-side sessions (students who booked this mentor) — mentors only
  useEffect(() => {
    if (!user?.id || user.role !== 'mentor') { setDataLoaded(true); return; }
    const unsub = subscribeToAdvisorSessions(user.id, (s) => {
      setAdvisorSessions(s);
    });
    return unsub;
  }, [user?.id, user?.role]);

  // Merge both lists, dedup by id
  const sessions = useMemo(() => {
    const map = new Map<string, BookedSession>();
    for (const s of [...studentSessions, ...advisorSessions]) map.set(s.id, s);
    return Array.from(map.values());
  }, [studentSessions, advisorSessions]);

  async function handleDelete(id: string) {
    await deleteSession(id);
  }

  // ── Calendar math ────────────────────────────────────────────────────────
  const firstDOW    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  type Cell = { day: number; iso: string } | null;
  const cells: Cell[] = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { day: d, iso };
    }),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate: Record<string, BookedSession[]> = {};
  for (const s of sessions) {
    byDate[s.dateISO] ??= [];
    byDate[s.dateISO].push(s);
  }

  const today = todayISO();
  const upcoming = sessions
    .filter(s => s.dateISO >= today && s.status !== 'declined')
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const past = sessions
    .filter(s => s.dateISO < today || s.status === 'declined')
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  const selectedSessions = selectedISO ? (byDate[selectedISO] ?? []) : [];

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedISO(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedISO(null);
  }

  if (!loaded || !user) return null;

  if (!dataLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Calendar</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
              <p className="mt-1 text-muted-foreground">
                {upcoming.length} upcoming session{upcoming.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ButtonLink href="/advisors" size="sm" className="w-fit">
              <Plus className="mr-2 h-4 w-4" /> Book a session
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-lg font-semibold">No sessions yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                Browse advisors and book a session. Your upcoming appointments will appear here.
              </p>
            </div>
            <ButtonLink href="/advisors">Browse advisors</ButtonLink>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* ── Calendar ────────────────────────────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <button
                    onClick={prevMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</p>
                  <button
                    onClick={nextMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 border-b border-border bg-muted/20">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {cells.map((cell, idx) => {
                    if (!cell) {
                      return (
                        <div
                          key={`blank-${idx}`}
                          className="h-16 border-b border-r border-border/40 [&:nth-child(7n)]:border-r-0 last:border-b-0 bg-muted/10"
                        />
                      );
                    }
                    const hasSessions = !!byDate[cell.iso];
                    const isToday    = cell.iso === today;
                    const isSelected = cell.iso === selectedISO;
                    const isPastDay  = cell.iso < today;
                    const dotSessions = byDate[cell.iso] ?? [];

                    return (
                      <button
                        key={cell.iso}
                        onClick={() => setSelectedISO(prev => prev === cell.iso ? null : cell.iso)}
                        className={cn(
                          'relative flex flex-col items-center gap-0.5 h-16 pt-1.5 pb-1',
                          'border-b border-r border-border/40 [&:nth-child(7n)]:border-r-0',
                          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                          isSelected ? 'bg-primary/10' :
                          hasSessions ? 'hover:bg-primary/5' : 'hover:bg-muted/40',
                          isPastDay && !hasSessions && 'opacity-35',
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors',
                          (isToday || isSelected) && 'bg-primary text-primary-foreground font-bold',
                        )}>
                          {cell.day}
                        </span>
                        {dotSessions.length > 0 && (
                          <div className="flex items-center gap-0.5">
                            {dotSessions.slice(0, 3).map(s => (
                              <div key={s.id} className={`h-1.5 w-1.5 rounded-full ${s.advisorAvatarColor || 'bg-violet-500'}`} />
                            ))}
                            {dotSessions.length > 3 && (
                              <span className="text-[9px] text-muted-foreground">+{dotSessions.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedISO && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-semibold text-sm mb-3">{formatLong(selectedISO)}</p>
                  {selectedSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sessions on this day.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedSessions.map(s => (
                        <SessionCard key={s.id} session={s} currentUserId={user.id} onDelete={handleDelete} compact />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">1</span>
                  Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Session dot = 1 booked session
                </span>
              </div>
            </div>

            {/* ── Upcoming + past list ──────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Upcoming</p>
                  {upcoming.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {upcoming.length}
                    </span>
                  )}
                </div>
                {upcoming.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/20 px-5 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
                    <ButtonLink href="/advisors" variant="outline" size="sm" className="mt-3">
                      Book a session
                    </ButtonLink>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcoming.map(s => (
                      <SessionCard key={s.id} session={s} currentUserId={user.id} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>

              {past.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Past</p>
                  <div className="flex flex-col gap-3">
                    {past.map(s => (
                      <SessionCard key={s.id} session={s} currentUserId={user.id} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Upcoming',  value: upcoming.length },
                    { label: 'Past',      value: past.length     },
                    { label: 'Sessions',  value: sessions.length },
                    { label: 'People',    value: new Set(sessions.map(s => s.advisorId === user.id ? s.studentId : s.advisorId)).size },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-lg bg-background border border-border/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="mt-0.5 text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/10 p-4">
                <ul className="flex flex-col gap-2">
                  {[
                    'Calendar invites sent after confirmation',
                    'Sessions recorded & transcribed with consent',
                    'All sessions are free — volunteer advisors',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
