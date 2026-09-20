'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, Plus, X, CalendarDays, History,
  LogOut, Star, Sparkles, ChevronDown, ChevronUp,
  School, Upload, CheckCircle2, Clock, AlertCircle, Pencil, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUpcomingCount } from '@/lib/sessions';
import { getMatchHistory, type MatchHistoryEntry } from '@/lib/matchHistory';
import { universities } from '@/lib/data';
import { validateTranscriptFile, uploadTranscript, validateProfilePhoto, uploadProfilePhoto } from '@/lib/storage';
import { cn } from '@/lib/utils';

// ── Dream Colleges ─────────────────────────────────────────────────────────────
function DreamColleges() {
  const { user, updateUser } = useAuth();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const dreamColleges = user?.dreamColleges ?? [];

  function handleInput(val: string) {
    setInput(val);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    const q = val.toLowerCase();
    setSuggestions(universities.filter(u => !dreamColleges.includes(u) && u.toLowerCase().includes(q)).slice(0, 5));
  }

  function addCollege(u: string) {
    if (!dreamColleges.includes(u)) updateUser({ dreamColleges: [...dreamColleges, u] });
    setInput(''); setSuggestions([]);
  }

  function removeCollege(u: string) {
    updateUser({ dreamColleges: dreamColleges.filter(c => c !== u) });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">Dream Colleges</h2>
      </div>

      {dreamColleges.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {dreamColleges.map(u => (
            <span key={u} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {u}
              <button onClick={() => removeCollege(u)} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">Add your dream colleges to get better matches.</p>
      )}

      <div className="relative">
        <Input
          placeholder="Search for a college…"
          value={input}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && suggestions.length > 0) { e.preventDefault(); addCollege(suggestions[0]); } }}
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
            {suggestions.map(s => (
              <button key={s} onClick={() => addCollege(s)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <Plus className="h-3.5 w-3.5 text-primary shrink-0" />{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {dreamColleges.length > 0 && (
        <ButtonLink href="/match" size="sm" className="mt-4 w-full justify-center">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find advisors for my dream schools
        </ButtonLink>
      )}
    </div>
  );
}

// ── High School ────────────────────────────────────────────────────────────────
function HighSchoolField() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user?.highSchool ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateUser({ highSchool: value.trim() || undefined });
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3">
      <School className="h-4 w-4 text-muted-foreground shrink-0" />
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Your high school"
            className="h-8 text-sm"
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          />
          <Button size="sm" onClick={save} disabled={saving} className="h-8 px-3 text-xs">
            {saving ? '…' : 'Save'}
          </Button>
          <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="text-sm text-left hover:text-primary transition-colors flex-1">
          {user?.highSchool ? (
            <span className="font-medium">{user.highSchool}</span>
          ) : (
            <span className="text-muted-foreground underline underline-offset-2">Add your high school</span>
          )}
        </button>
      )}
    </div>
  );
}

// ── Transcript Upload ─────────────────────────────────────────────────────────
function TranscriptUpload() {
  const { user, updateUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const status = user?.transcriptStatus;
  const hasTranscript = !!(user?.transcriptDataUrl ?? user?.transcriptPath ?? user?.transcriptUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadError('');
    setUploadProgress(0);

    const validation = validateTranscriptFile(file);
    if (!validation.valid) { setUploadError(validation.error!); return; }

    setUploading(true);
    try {
      const result = await uploadTranscript(user.id, user.role, file, setUploadProgress);
      await updateUser(
        result.inline
          ? { transcriptDataUrl: result.dataUrl, transcriptStatus: 'pending' }
          : { transcriptPath: result.path, transcriptStatus: 'pending' },
      );
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">
          {user?.role === 'mentor' ? 'College Transcript' : 'High School Transcript'}
        </h2>
        {hasTranscript && (
          <span className={cn(
            'ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            status === 'verified'  ? 'bg-emerald-100 text-emerald-700' :
            status === 'rejected'  ? 'bg-red-100 text-red-700' :
                                     'bg-amber-100 text-amber-700'
          )}>
            {status === 'verified'  ? <><CheckCircle2 className="h-3 w-3" /> Verified</> :
             status === 'rejected'  ? <><AlertCircle className="h-3 w-3" /> Rejected</> :
                                      <><Clock className="h-3 w-3" /> Under Review</>}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {user?.role === 'mentor'
          ? 'Upload your college transcript to verify your enrollment and build student trust.'
          : 'Upload your high school transcript to share with advisors (optional).'}
      </p>

      {hasTranscript && status === 'pending' && (
        <div className="mb-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800">
          Your transcript is under review. We&apos;ll notify you once verified.
        </div>
      )}

      {hasTranscript && status === 'verified' && (
        <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
          Transcript verified. A verified badge will appear on your profile.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFile}
        className="hidden"
        id="transcript-upload"
      />

      {uploadError && (
        <p className="mb-3 text-xs text-destructive">{uploadError}</p>
      )}

      {uploading ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-foreground">Uploading…</span>
            {uploadProgress > 0 && (
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            {uploadProgress > 0 ? (
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            ) : (
              <div className="h-full w-full rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      ) : (
        <label
          htmlFor="transcript-upload"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <Upload className="h-4 w-4 text-muted-foreground" />
          {hasTranscript ? 'Replace transcript' : 'Upload transcript (PDF or image)'}
        </label>
      )}
    </div>
  );
}

// ── Match History ──────────────────────────────────────────────────────────────
function MatchHistorySection() {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { setHistory(getMatchHistory()); }, []);
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">Recent Searches</h2>
        <span className="ml-auto text-xs text-muted-foreground">{history.length} saved</span>
      </div>
      <div className="flex flex-col gap-2">
        {history.map(entry => (
          <div key={entry.id} className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium">{entry.colleges.slice(0, 2).join(', ')}{entry.colleges.length > 2 ? ` +${entry.colleges.length - 2}` : ''}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(entry.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {entry.topAdvisorIds.length} match{entry.topAdvisorIds.length !== 1 ? 'es' : ''}
                </p>
              </div>
              {expanded === entry.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
            </button>
            {expanded === entry.id && (
              <div className="border-t border-border px-4 py-3 bg-muted/10">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {entry.interests.map(i => <span key={i} className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{i}</span>)}
                </div>
                <ButtonLink href="/match" variant="outline" size="sm">Run this search again</ButtonLink>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Upcoming Sessions ─────────────────────────────────────────────────────────
function UpcomingSessions() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUpcomingCount(user.id, setUpcoming);
    return unsub;
  }, [user?.id]);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">My Sessions</span>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{upcoming} upcoming</span>
      </div>
      <ButtonLink href="/calendar" variant="outline" size="sm" className="mt-3 w-full justify-center">View calendar</ButtonLink>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, loaded, logout, updateUser } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (loaded && !user) router.push('/login');
  }, [loaded, user, router]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    const validation = validateProfilePhoto(file);
    if (!validation.valid) { setPhotoError(validation.error!); return; }
    setPhotoUploading(true);
    try {
      const dataUrl = await uploadProfilePhoto(file);
      await updateUser({ photoDataUrl: dataUrl });
    } catch {
      setPhotoError('Upload failed. Please try again.');
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  if (!loaded || !user) return null;
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="border-b border-border bg-muted/30 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
                <AvatarImage src={user.photoDataUrl} alt={user.name} />
                <AvatarFallback className={cn(
                  'text-xl font-bold text-white',
                  user.avatarColor ?? 'bg-primary'
                )}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                title="Change photo"
              >
                {photoUploading
                  ? <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  : <Camera className="h-3 w-3 text-foreground" />
                }
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                </div>
                <ButtonLink
                  href="/profile/edit"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </ButtonLink>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                  user.role === 'mentor' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                )}>
                  {user.role === 'mentor' ? 'Volunteer Advisor' : 'Student'}
                </span>
                {user.role === 'mentor' && user.university && (
                  <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {user.universityShort ?? user.university}
                  </span>
                )}
              </div>
            </div>
          </div>

          {photoError && (
            <p className="mt-2 text-xs text-destructive">{photoError}</p>
          )}

          {/* High school row */}
          <div className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3">
            <HighSchoolField />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 flex flex-col gap-5">
        {user.role === 'student' && <DreamColleges />}
        <TranscriptUpload />
        <UpcomingSessions />
        <MatchHistorySection />

        <div className="grid grid-cols-2 gap-3">
          <ButtonLink href="/advisors" variant="outline" className="justify-center">Browse Advisors</ButtonLink>
          <ButtonLink href="/match" variant="outline" className="justify-center">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find My Match
          </ButtonLink>
          <ButtonLink href="/messages" variant="outline" className="justify-center">My Messages</ButtonLink>
          <ButtonLink href="/knowledge" variant="outline" className="justify-center">
            <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Knowledge Base
          </ButtonLink>
        </div>

        {user.role === 'mentor' && (
          <ButtonLink href="/dashboard" className="w-full justify-center">
            Go to Mentor Dashboard
          </ButtonLink>
        )}

        <button
          onClick={() => { logout(); router.push('/'); }}
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
