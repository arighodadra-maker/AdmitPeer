'use client';

import { useState } from 'react';
import { CheckCircle2, CalendarDays, Video, ExternalLink, Clock, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { cn } from '@/lib/utils';
import type { Advisor, SessionType } from '@/lib/data';
import { getAdvisorAvailability } from '@/lib/data';
import { saveSession } from '@/lib/sessions';
import { useAuth } from '@/contexts/AuthContext';

type Props = { advisor: Advisor };
type Step = 'select' | 'schedule' | 'form' | 'confirm';

function generateMeetingLink(advisorId: string, seed: string): string {
  const rand = seed.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();
  return `https://meet.jit.si/AdmitPeer-${advisorId}-${rand}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getAvailableDOW(pattern: string): Set<number> {
  if (pattern.includes('Mon / Wed / Fri')) return new Set([1, 3, 5]);
  if (pattern.includes('Tue / Thu'))       return new Set([2, 4]);
  if (pattern.includes('Fri – Sun'))       return new Set([5, 6, 0]);
  if (pattern.includes('Weekend'))         return new Set([0, 6]);
  if (pattern.includes('Weekday'))         return new Set([1, 2, 3, 4, 5]);
  return new Set([0, 1, 2, 3, 4, 5, 6]);
}

function getTimeSlots(pattern: string): string[] {
  if (pattern.includes('after 4 PM'))  return ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
  if (pattern.includes('evening'))     return ['6:00 PM', '7:00 PM', '8:00 PM'];
  if (pattern.includes('afternoon'))   return ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  return ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '4:00 PM', '5:00 PM'];
}

function ScheduleStep({
  advisor,
  onPick,
  onBack,
}: {
  advisor: Advisor;
  onPick: (dateISO: string, timeSlot: string) => void;
  onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const avail = getAdvisorAvailability(advisor.id);
  const availDOW = getAvailableDOW(avail.days);
  const timeSlots = getTimeSlots(avail.days);

  const days: Array<{ iso: string; day: number; dow: number; month: number; primary: boolean }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ iso, day: d.getDate(), dow: d.getDay(), month: d.getMonth(), primary: availDOW.has(d.getDay()) });
  }

  function handlePick() {
    if (selectedDate && selectedTime) onPick(selectedDate, selectedTime);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-muted/40 border border-border/50 p-3">
        <p className="text-xs text-muted-foreground">Advisor availability</p>
        <p className="font-medium text-sm">{avail.days} <span className="text-xs text-muted-foreground">({avail.tz})</span></p>
        <p className="text-xs text-emerald-600 font-medium mt-0.5">{avail.next}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-foreground">Pick a date</p>
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => (
            <button
              key={d.iso}
              onClick={() => { setSelectedDate(d.iso); setSelectedTime(null); }}
              className={cn(
                'flex flex-col items-center rounded-xl border py-2 transition-all text-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedDate === d.iso
                  ? 'border-primary bg-primary text-primary-foreground'
                  : d.primary
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40'
              )}
            >
              <span className="text-[9px] font-medium leading-none mb-0.5">{DAY_NAMES[d.dow]}</span>
              <span className="text-xs font-bold leading-none">{d.day}</span>
              <span className="text-[8px] leading-none mt-0.5 opacity-70">{MONTH_ABBR[d.month]}</span>
            </button>
          ))}
        </div>
        {selectedDate && (
          <p className="mt-1.5 text-xs text-muted-foreground text-center">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {selectedDate && (
        <div>
          <p className="mb-2 text-xs font-medium text-foreground">Pick a time</p>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedTime === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
                )}
              >
                <Clock className="inline h-3 w-3 mr-1.5 opacity-70" />
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={!selectedDate || !selectedTime}
          onClick={handlePick}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default function BookingModal({ advisor }: Props) {
  const { user, loaded } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  const [pickedDate, setPickedDate] = useState<{ dateISO: string; timeSlot: string } | null>(null);
  const [goal, setGoal] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSchedulePick(dateISO: string, timeSlot: string) {
    setPickedDate({ dateISO, timeSlot });
    setStep('form');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession || !pickedDate || !user) return;
    setSubmitting(true);

    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const link = generateMeetingLink(advisor.id, seed);
    setMeetingLink(link);

    await saveSession({
      advisorId: advisor.id,
      advisorName: advisor.name,
      advisorInitials: advisor.initials ?? advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      advisorAvatarColor: advisor.avatarColor ?? 'bg-violet-500',
      advisorUniversity: advisor.university,
      advisorUniversityShort: advisor.universityShort,
      sessionType: selectedSession.type,
      sessionDuration: selectedSession.duration,
      dateISO: pickedDate.dateISO,
      timeSlot: pickedDate.timeSlot,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      goal,
      status: 'pending',
      meetingLink: link,
    });

    setSubmitting(false);
    setStep('confirm');
  }

  function reset() {
    setStep('select');
    setSelectedSession(null);
    setPickedDate(null);
    setGoal('');
    setMeetingLink('');
  }

  // Must be signed in to book
  if (loaded && !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <LogIn className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Sign in to book a session</p>
          <p className="mt-1 text-xs text-muted-foreground">You need an account to request a session.</p>
        </div>
        <ButtonLink href="/login" size="sm">Sign in</ButtonLink>
      </div>
    );
  }

  // Can't book yourself
  if (user?.id === advisor.id) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm font-semibold">This is your own profile</p>
        <p className="text-xs text-muted-foreground">You can't book a session with yourself.</p>
      </div>
    );
  }

  const firstName = advisor.name.split(' ')[0];

  // ── Confirm ──
  if (step === 'confirm' && pickedDate) {
    const [y, m, d] = pickedDate.dateISO.split('-').map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });

    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Request sent!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {firstName} will confirm your <strong>{selectedSession?.type}</strong> session.
            Check <strong>My Sessions</strong> for status updates.
          </p>
        </div>
        <div className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium">{dateLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {pickedDate.timeSlot} · {selectedSession?.duration} · Free
          </p>
          {meetingLink && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline pl-0"
            >
              <Video className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-emerald-700">Join meeting room</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}
        </div>
        <div className="flex w-full gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
            Book another
          </Button>
          <ButtonLink href="/calendar" size="sm" className="flex-1 justify-center">
            View in calendar
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ── Form ──
  if (step === 'form' && selectedSession && pickedDate) {
    const [y, m, d] = pickedDate.dateISO.split('-').map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl bg-muted/40 border border-border/50 p-3">
          <p className="text-xs text-muted-foreground">Booking as <strong>{user?.name}</strong></p>
          <p className="font-medium text-sm">{selectedSession.type}</p>
          <p className="text-xs text-muted-foreground">{dateLabel} · {pickedDate.timeSlot} · {selectedSession.duration} · Free</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            What do you most want to get out of this session?
          </label>
          <textarea
            required
            rows={3}
            placeholder={`e.g. I want to understand what made ${firstName}'s application stand out…`}
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setStep('schedule')} className="flex-1">
            Back
          </Button>
          <Button type="submit" size="sm" className="flex-1" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Confirm booking'}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          This session is completely free — {firstName} is a volunteer
        </p>
      </form>
    );
  }

  // ── Schedule ──
  if (step === 'schedule' && selectedSession) {
    return (
      <ScheduleStep
        advisor={advisor}
        onPick={handleSchedulePick}
        onBack={() => setStep('select')}
      />
    );
  }

  // ── Select ──
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">Choose a session type:</p>
      {advisor.sessions.map(session => (
        <button
          key={session.type}
          onClick={() => { setSelectedSession(session); setStep('schedule'); }}
          className={cn(
            'w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{session.type}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Free</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{session.duration} · {session.description}</p>
        </button>
      ))}
    </div>
  );
}
