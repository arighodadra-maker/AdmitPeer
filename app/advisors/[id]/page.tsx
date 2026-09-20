'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, CheckCircle2, GraduationCap, MapPin, BookOpen, CalendarDays, Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getUserProfile, type AuthUser } from '@/lib/auth';
import { DEFAULT_SESSIONS, getAdvisorAvailability, type Advisor } from '@/lib/data';
import UniversityLogo from '@/components/UniversityLogo';
import BookingModal from './BookingModal';
import ContactModal from './ContactModal';
import NotesPanel from './NotesPanel';
import QAThread from './QAThread';

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

export default function AdvisorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getUserProfile(id).then(profile => {
      if (!profile || profile.role !== 'mentor' || !profile.university) {
        setNotFound(true);
      } else {
        setAdvisor(mentorToAdvisor(profile));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (notFound || !advisor) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold">Advisor not found</p>
        <p className="text-sm text-muted-foreground">This profile may have been removed or doesn&apos;t exist.</p>
        <Link href="/advisors" className="text-sm text-primary hover:underline">Back to advisors</Link>
      </div>
    );
  }

  const availability = getAdvisorAvailability(advisor.id);
  const firstName = advisor.name.split(' ')[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/advisors" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to advisors
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Header card */}
          <Card className="overflow-hidden">
            <div className={`h-1.5 w-full ${advisor.avatarColor}`} />
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 shrink-0 ring-2 ring-background shadow-md">
                  <AvatarFallback className={`${advisor.avatarColor} text-white text-2xl font-bold`}>
                    {advisor.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold leading-tight">{advisor.name}</h1>
                      <p className="text-primary font-semibold">{advisor.major}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-sm">{advisor.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({advisor.totalSessions} sessions)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <UniversityLogo university={advisor.university} size="md" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{advisor.university}</p>
                      <p className="text-xs text-muted-foreground">Class of {advisor.graduationYear} · {advisor.major}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {advisor.highSchool && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 shrink-0" /> {advisor.highSchool}
                      </span>
                    )}
                    {advisor.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" /> {advisor.location}
                      </span>
                    )}
                  </div>

                  {advisor.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {advisor.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {advisor.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" /> About {firstName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{advisor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Background */}
          {(advisor.activities.length > 0 || advisor.gpa || advisor.sat > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Background</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(advisor.gpa || advisor.sat > 0 || advisor.highSchool) && (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {advisor.gpa && (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">GPA</p>
                          <p className="mt-1 font-semibold text-sm">{advisor.gpa}</p>
                        </div>
                      )}
                      {advisor.sat > 0 && (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xs text-muted-foreground">SAT</p>
                          <p className="mt-1 font-semibold text-sm">{advisor.sat.toLocaleString()}</p>
                        </div>
                      )}
                      {advisor.highSchool && (
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center col-span-2 sm:col-span-1">
                          <p className="text-xs text-muted-foreground">High School</p>
                          <p className="mt-1 font-semibold text-sm leading-tight">{advisor.highSchool}</p>
                        </div>
                      )}
                    </div>
                    {advisor.activities.length > 0 && <Separator />}
                  </>
                )}
                {advisor.activities.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium">Activities & Achievements</p>
                    <ul className="flex flex-col gap-2">
                      {advisor.activities.map(act => (
                        <li key={act} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />{act}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Available Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {advisor.sessions.map(session => (
                <div key={session.type} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-medium text-sm">{session.type}</p>
                    <p className="text-xs text-muted-foreground">{session.description}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" /> {session.duration}
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Free</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Q&A Thread */}
          <Card>
            <CardContent className="p-5">
              <QAThread
                advisorId={advisor.id}
                advisorName={advisor.name}
                advisorUniversityShort={advisor.universityShort}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your Session Workspace</p>
            <NotesPanel advisorId={advisor.id} advisorFirstName={firstName} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-4">

            <Card className="border-border/80">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Session cost</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-0.5">Free</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Volunteer advisor — no payment required</p>
                  </div>
                  <UniversityLogo university={advisor.university} size="sm" />
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Availability</p>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{availability.days}</span>
                    <span className="text-xs text-muted-foreground">({availability.tz})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm text-emerald-700 font-medium">{availability.next}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schedule a Session</CardTitle>
                <p className="text-sm text-muted-foreground">Free — {firstName} is a volunteer advisor</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <BookingModal advisor={advisor} />
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <ContactModal advisor={advisor} />
              </CardContent>
            </Card>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <ul className="flex flex-col gap-2">
                {['Completely free — volunteer advisor', 'Real story from someone who just got in', 'Sessions transcribed with consent'].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
