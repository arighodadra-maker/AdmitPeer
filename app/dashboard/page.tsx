'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, MessageCircle, CalendarDays, CheckCircle2,
  Clock, Star, BookOpen, ArrowRight,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeToAdvisorSessions, updateSessionStatus,
  type BookedSession,
} from '@/lib/sessions';
import { subscribeToUserConversations, getSenderName, type Message } from '@/lib/messages';
import { subscribeToAdvisorQA, type QASubmission } from '@/lib/qa';
import { cn } from '@/lib/utils';

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="flex justify-center mb-2 text-primary">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function SessionRow({ session, onAccept, onDecline }: {
  session: BookedSession;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}) {
  const [y, m, d] = session.dateISO.split('-').map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const isUpcoming = session.dateISO >= new Date().toISOString().split('T')[0];
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    await fn();
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-muted text-xs font-bold">
          {session.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{session.studentName}</p>
        <p className="text-xs text-muted-foreground truncate">{session.sessionType} · {session.sessionDuration}</p>
        {session.goal && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">{session.goal}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium text-foreground">{dateLabel}</p>
        <p className="text-xs text-muted-foreground">{session.timeSlot}</p>
      </div>
      {isUpcoming && session.status === 'pending' ? (
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => act(() => onDecline(session.id))}
            disabled={busy}
            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={() => act(() => onAccept(session.id))}
            disabled={busy}
            className="rounded-lg bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      ) : (
        <span className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          session.status === 'declined'  ? 'bg-destructive/10 text-destructive' :
          session.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
          !isUpcoming                   ? 'bg-muted text-muted-foreground' :
                                          'bg-amber-100 text-amber-700'
        )}>
          {session.status === 'declined'  ? 'Declined' :
           session.status === 'confirmed' ? 'Confirmed' :
           !isUpcoming                   ? 'Done' : 'Pending'}
        </span>
      )}
    </div>
  );
}

function MessageRow({ msg }: { msg: Message }) {
  const senderName = getSenderName(msg);
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted text-[10px] font-bold">
          {senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{senderName}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.content}</p>
      </div>
    </div>
  );
}

function QARow({ q }: { q: QASubmission }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug line-clamp-2">{q.question}</p>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Unanswered</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground capitalize">{q.category.replace('-', ' ')} · asked by {q.studentName}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loaded } = useAuth();
  const [sessions, setSessions] = useState<BookedSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [qaItems, setQaItems]   = useState<QASubmission[]>([]);

  useEffect(() => {
    if (loaded && !user) { router.push('/login'); return; }
    if (loaded && user?.role !== 'mentor') { router.push('/profile'); return; }
  }, [loaded, user, router]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToAdvisorSessions(user.id, setSessions);
    return unsub;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserConversations(user.id, (convs) => {
      const incoming = convs
        .flatMap(c => c.messages.filter(m => m.fromId !== user.id))
        .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
      setMessages(incoming);
    });
    return unsub;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToAdvisorQA(user.id, (submissions) => {
      setQaItems(submissions.filter(s => s.status === 'pending'));
    });
    return unsub;
  }, [user?.id]);

  async function handleAccept(id: string) {
    await updateSessionStatus(id, 'confirmed');
  }

  async function handleDecline(id: string) {
    await updateSessionStatus(id, 'declined');
  }

  if (!loaded || !user || user.role !== 'mentor') return null;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = sessions.filter(s => s.dateISO >= today && s.status !== 'declined');
  const past = sessions.filter(s => s.dateISO < today || s.status === 'declined');
  const initials = user.initials ?? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Mentor Dashboard</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              {user.university && (
                <p className="mt-1 text-muted-foreground">{user.university} · {user.major}</p>
              )}
            </div>
            {user.profileComplete && (
              <ButtonLink href={`/advisors/${user.id}`} variant="outline" size="sm" className="shrink-0">
                View Public Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </ButtonLink>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          <StatCard label="Total requests" value={sessions.length} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Upcoming" value={upcoming.length} icon={<CalendarDays className="h-5 w-5" />} />
          <StatCard label="Messages" value={messages.length} icon={<MessageCircle className="h-5 w-5" />} />
          <StatCard label="Q&As pending" value={qaItems.length} icon={<BookOpen className="h-5 w-5" />} />
        </div>

        {!user.profileComplete && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="font-semibold text-amber-900">Complete your profile</p>
            <p className="mt-1 text-sm text-amber-800">Finish setting up your advisor profile so students can find and book you.</p>
            <ButtonLink href="/onboarding/mentor" size="sm" className="mt-3">
              Complete profile setup
            </ButtonLink>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Requests
                </h2>
                {upcoming.length > 0 && <Badge variant="secondary">{upcoming.length}</Badge>}
              </div>
              {upcoming.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/20 px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming sessions yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Students will appear here when they book with you.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcoming.map(s => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" /> Messages
                </h2>
                {messages.length > 0 && (
                  <ButtonLink href="/messages" variant="ghost" size="sm" className="text-xs">View all</ButtonLink>
                )}
              </div>
              {messages.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/20 px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.slice(0, 3).map(m => <MessageRow key={m.id} msg={m} />)}
                </div>
              )}
            </div>

            {qaItems.length > 0 && (
              <div>
                <h2 className="font-semibold flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-primary" /> Pending Q&A Questions
                </h2>
                <div className="flex flex-col gap-2">
                  {qaItems.map(q => <QARow key={q.id} q={q} />)}
                </div>
                <ButtonLink href={`/advisors/${user.id}#qa`} variant="outline" size="sm" className="mt-3">
                  Answer on your profile
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your Profile</p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${user.avatarColor ?? 'bg-violet-500'} text-white font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  {user.universityShort && <p className="text-xs text-primary">{user.universityShort}</p>}
                  {user.major && <p className="text-xs text-muted-foreground">{user.major}</p>}
                </div>
              </div>
              {user.rating !== undefined && (
                <div className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border/50 px-3 py-2 mb-4">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{(user.rating ?? 5).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({user.totalSessions ?? 0} sessions)</span>
                </div>
              )}
              <ButtonLink href={`/advisors/${user.id}`} size="sm" className="w-full justify-center">
                View Public Profile
              </ButtonLink>
            </div>

            {past.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Past Sessions</p>
                <div className="flex flex-col gap-2">
                  {past.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{s.studentName}</span>
                      <span className="shrink-0">{s.sessionType.split(' ')[0]}</span>
                    </div>
                  ))}
                  {past.length > 3 && <p className="text-xs text-muted-foreground">+{past.length - 3} more</p>}
                </div>
              </div>
            )}

            {user.sessions && user.sessions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your Sessions</p>
                <div className="flex flex-col gap-2">
                  {user.sessions.map(s => (
                    <div key={s.type} className="flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{s.type}</span>
                      <span className="ml-auto text-muted-foreground">{s.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
