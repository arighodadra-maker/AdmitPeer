'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { GraduationCap, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { saveUserProfile, type UserRole } from '@/lib/auth';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with that email already exists. Sign in instead.',
  'auth/invalid-email':        'Enter a valid email address.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/operation-not-allowed':'Email/password sign-up is not enabled. Contact support.',
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [role, setRole]         = useState<UserRole>('student');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });

      await saveUserProfile(cred.user.uid, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        dreamColleges: [],
        advisorId: role === 'mentor' ? cred.user.uid : undefined,
        profileComplete: role === 'student' ? true : false,
        createdAt: new Date().toISOString(),
      });

      router.push(role === 'mentor' ? '/onboarding/mentor' : '/profile');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(FIREBASE_ERRORS[code] ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join AdmitPeer — it&apos;s completely free</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Your name</label>
              <Input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Email address</label>
              <Input required type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  required
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {(['student', 'mentor'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      role === r
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/50'
                    }`}
                  >
                    {r === 'mentor' ? 'Volunteer advisor' : 'Student'}
                  </button>
                ))}
              </div>
              {role === 'mentor' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  You&apos;ll set up your advisor profile on the next step.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
