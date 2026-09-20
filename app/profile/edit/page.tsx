'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { universities } from '@/lib/data';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  { label: 'Violet',  value: 'bg-violet-500' },
  { label: 'Blue',    value: 'bg-blue-500' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Rose',    value: 'bg-rose-500' },
  { label: 'Amber',   value: 'bg-amber-500' },
  { label: 'Cyan',    value: 'bg-cyan-500' },
  { label: 'Indigo',  value: 'bg-indigo-500' },
  { label: 'Pink',    value: 'bg-pink-500' },
];

const INTEREST_TAGS = [
  'CS', 'STEM', 'Pre-Med', 'Biology', 'Engineering', 'Business', 'Finance',
  'Entrepreneurship', 'Research', 'Humanities', 'Political Science', 'Writing',
  'Arts', 'Film', 'Journalism', 'Pre-Law', 'Environment', 'Public Health',
  'Liberal Arts', 'First-Gen', 'Athletics', 'Neuroscience', 'Aerospace', 'Robotics',
];

const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 4 - i);

function uniShort(full: string): string {
  const map: Record<string, string> = {
    'Harvard University': 'Harvard', 'Yale University': 'Yale', 'Princeton University': 'Princeton',
    'Columbia University': 'Columbia', 'University of Pennsylvania': 'UPenn', 'Brown University': 'Brown',
    'Dartmouth College': 'Dartmouth', 'Cornell University': 'Cornell', 'Stanford University': 'Stanford',
    'MIT': 'MIT', 'Caltech': 'Caltech', 'Duke University': 'Duke', 'Northwestern University': 'Northwestern',
    'Johns Hopkins University': 'Johns Hopkins', 'Georgetown University': 'Georgetown', 'Rice University': 'Rice',
    'Vanderbilt University': 'Vanderbilt', 'Carnegie Mellon University': 'CMU',
    'University of Notre Dame': 'Notre Dame', 'Washington University in St. Louis': 'WashU',
    'Emory University': 'Emory', 'Tufts University': 'Tufts', 'NYU': 'NYU',
    'UC Berkeley': 'UC Berkeley', 'UCLA': 'UCLA', 'UC San Diego': 'UCSD',
    'University of Michigan': 'Michigan', 'University of Virginia': 'UVA',
    'UNC Chapel Hill': 'UNC', 'Georgia Tech': 'Georgia Tech', 'UT Austin': 'UT Austin',
    'University of Southern California': 'USC', 'Northeastern University': 'Northeastern',
    'Boston University': 'BU', 'Boston College': 'BC', 'Tulane University': 'Tulane',
    'Barnard College': 'Barnard', 'Williams College': 'Williams', 'Amherst College': 'Amherst',
    'Swarthmore College': 'Swarthmore', 'Wellesley College': 'Wellesley', 'Pomona College': 'Pomona',
  };
  return map[full] ?? full.split(' ')[0];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  // Shared fields
  const [name, setName]           = useState(user?.name ?? '');
  const [highSchool, setHighSchool] = useState(user?.highSchool ?? '');
  const [avatarColor, setColor]   = useState(user?.avatarColor ?? 'bg-violet-500');

  // Mentor-only fields
  const [university, setUniversity]   = useState(user?.university ?? '');
  const [uniSuggestions, setUniSuggs] = useState<string[]>([]);
  const [major, setMajor]             = useState(user?.major ?? '');
  const [graduationYear, setGradYear] = useState(user?.graduationYear ?? new Date().getFullYear() + 2);
  const [bio, setBio]                 = useState(user?.bio ?? '');
  const [activityInput, setActInput]  = useState('');
  const [activities, setActivities]   = useState<string[]>(user?.activities ?? []);
  const [selectedTags, setTags]       = useState<string[]>(user?.tags ?? []);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const isMentor = user?.role === 'mentor';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ME';

  function handleUniversityInput(val: string) {
    setUniversity(val);
    if (val.trim().length < 2) { setUniSuggs([]); return; }
    const q = val.toLowerCase();
    setUniSuggs(universities.filter(u => u.toLowerCase().includes(q)).slice(0, 6));
  }

  function addActivity() {
    const a = activityInput.trim();
    if (a && !activities.includes(a)) setActivities(prev => [...prev, a]);
    setActInput('');
  }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required.'); return; }
    if (isMentor) {
      if (!university) { setError('Please select your university.'); return; }
      if (!major.trim()) { setError('Please enter your major.'); return; }
      if (!bio.trim() || bio.trim().length < 50) { setError('Bio must be at least 50 characters.'); return; }
    }

    setLoading(true);
    try {
      const updates: Parameters<typeof updateUser>[0] = {
        name: name.trim(),
        highSchool: highSchool.trim() || undefined,
        avatarColor,
        initials: name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      };

      if (isMentor) {
        Object.assign(updates, {
          university,
          universityShort: uniShort(university),
          major: major.trim(),
          graduationYear,
          bio: bio.trim(),
          activities,
          tags: selectedTags,
        });
      }

      await updateUser(updates);
      router.push('/profile');
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Changes are saved to your account</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Basic Info</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Display name *</label>
            <Input
              required
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {isMentor ? 'High school you attended' : 'High school'}
            </label>
            <Input
              placeholder="e.g. Harvard-Westlake School"
              value={highSchool}
              onChange={e => setHighSchool(e.target.value)}
            />
          </div>
        </div>

        {/* Mentor-only: college info */}
        {isMentor && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">College</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">University *</label>
              <div className="relative">
                <Input
                  placeholder="Search your university…"
                  value={university}
                  onChange={e => handleUniversityInput(e.target.value)}
                  autoComplete="off"
                />
                {uniSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
                    {uniSuggestions.map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => { setUniversity(u); setUniSuggs([]); }}
                        className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Major *</label>
                <Input
                  required={isMentor}
                  placeholder="Computer Science"
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Graduation year</label>
                <select
                  value={graduationYear}
                  onChange={e => setGradYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Mentor-only: bio */}
        {isMentor && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Your Story</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio *</label>
              <textarea
                required={isMentor}
                rows={5}
                placeholder="Tell students about your college journey, what makes your application unique, and what you love about your school…"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <p className={cn('mt-1 text-xs', bio.length < 50 ? 'text-muted-foreground' : 'text-emerald-600')}>
                {bio.length} / 50 chars minimum
              </p>
            </div>
          </div>
        )}

        {/* Mentor-only: activities */}
        {isMentor && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Activities & Achievements</h2>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Varsity Tennis Captain"
                value={activityInput}
                onChange={e => setActInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addActivity(); } }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {activities.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {activities.map(a => (
                  <div key={a} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />{a}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivities(prev => prev.filter(x => x !== a))}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mentor-only: expertise tags */}
        {isMentor && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Areas of Expertise</h2>
            <p className="text-xs text-muted-foreground">Help students find you by selecting what you know best.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all',
                    selectedTags.includes(tag)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {selectedTags.includes(tag) && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Avatar color — all users */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Profile Color</h2>
          <div className="flex items-center gap-4">
            <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-lg font-bold', avatarColor)}>
              {initials}
            </div>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    `h-8 w-8 rounded-full transition-all ${c.value}`,
                    avatarColor === c.value
                      ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                      : 'hover:scale-105'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
