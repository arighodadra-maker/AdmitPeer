'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Plus, X, CheckCircle2 } from 'lucide-react';
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

export default function MentorOnboarding() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [university, setUniversity]     = useState('');
  const [uniSuggestions, setUniSuggs]   = useState<string[]>([]);
  const [major, setMajor]               = useState('');
  const [graduationYear, setGradYear]   = useState(new Date().getFullYear() + 2);
  const [highSchool, setHighSchool]     = useState('');
  const [bio, setBio]                   = useState('');
  const [activityInput, setActInput]    = useState('');
  const [activities, setActivities]     = useState<string[]>([]);
  const [selectedTags, setTags]         = useState<string[]>([]);
  const [avatarColor, setColor]         = useState('bg-violet-500');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  function handleUniversityInput(val: string) {
    setUniversity(val);
    if (val.trim().length < 2) { setUniSuggs([]); return; }
    const q = val.toLowerCase();
    setUniSuggs(universities.filter(u => u.toLowerCase().includes(q)).slice(0, 6));
  }

  function selectUniversity(u: string) {
    setUniversity(u);
    setUniSuggs([]);
  }

  function addActivity() {
    const a = activityInput.trim();
    if (a && !activities.includes(a)) setActivities(prev => [...prev, a]);
    setActInput('');
  }

  function removeActivity(a: string) {
    setActivities(prev => prev.filter(x => x !== a));
  }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!university) { setError('Please select your university.'); return; }
    if (!major.trim()) { setError('Please enter your major.'); return; }
    if (!bio.trim() || bio.trim().length < 50) { setError('Bio must be at least 50 characters.'); return; }

    setLoading(true);
    try {
      const initials = (user?.name ?? 'A B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      await updateUser({
        university,
        universityShort: uniShort(university),
        major: major.trim(),
        graduationYear,
        highSchool: highSchool.trim() || undefined,
        bio: bio.trim(),
        activities,
        tags: selectedTags,
        avatarColor,
        initials,
        rating: 5.0,
        totalSessions: 0,
        featured: false,
        sessions: [
          { type: 'Story Session',    duration: '45 min', description: 'Hear the full story of how I got in.' },
          { type: 'Essay Review',     duration: '60 min', description: 'Live feedback on your draft essays.' },
          { type: 'Strategy Session', duration: '60 min', description: 'Activity list, course selection, and timeline planning.' },
        ],
        profileComplete: true,
      });
      router.push('/dashboard');
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Set up your advisor profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Students will see this when booking sessions with you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* University */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Your College</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium">University *</label>
            <div className="relative">
              <Input
                required
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
                      onClick={() => selectUniversity(u)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
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
              <Input required placeholder="Computer Science" value={major} onChange={e => setMajor(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Graduation Year</label>
              <select
                value={graduationYear}
                onChange={e => setGradYear(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">High School you attended</label>
            <Input placeholder="Harvard-Westlake School" value={highSchool} onChange={e => setHighSchool(e.target.value)} />
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Your Story</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio *</label>
            <textarea
              required
              rows={5}
              placeholder="Tell students about your college journey, what makes your application unique, and what you love about your school…"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">{bio.length} chars (min 50)</p>
          </div>
        </div>

        {/* Activities */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Activities & Achievements</h2>
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
                  <button type="button" onClick={() => removeActivity(a)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Areas of Expertise</h2>
          <p className="text-xs text-muted-foreground">Select all that apply — these help students find you.</p>
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

        {/* Avatar color */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Profile Color</h2>
          <div className="flex gap-3 flex-wrap">
            {AVATAR_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  `h-9 w-9 rounded-full ${c.value} transition-all`,
                  avatarColor === c.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                )}
                title={c.label}
              />
            ))}
          </div>
          {/* Preview */}
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${avatarColor} text-white text-lg font-bold mt-1`}>
            {(user?.name ?? 'A B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Saving profile…' : 'Complete setup & go to dashboard'}
        </Button>
      </form>
    </div>
  );
}
