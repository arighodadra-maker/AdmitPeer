'use client';

import { useState } from 'react';
import { CheckCircle2, Heart, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PERKS = [
  { icon: Heart, title: 'Make a real difference', body: 'Share the honest story of how you got in. For a low-income student with no counselor, one conversation can change everything.' },
  { icon: Clock, title: 'Your schedule, your choice', body: 'Volunteer when it works for you. Accept only the sessions you want — no minimum, no pressure.' },
  { icon: Users, title: 'Pay it forward', body: 'AdmitPeer exists to give first-gen and low-income students access to the same insider knowledge private school kids take for granted.' },
];

const FAQS = [
  {
    q: 'Do I need to be a college counselor or expert?',
    a: 'No. You just need to have been admitted to your school. Students want your real story, not a professional opinion.',
  },
  {
    q: 'How much time does it take?',
    a: 'As little or as much as you want. Sessions are 45–60 minutes each. Most volunteers do 2–5 sessions per semester.',
  },
  {
    q: 'How many students will I work with?',
    a: 'It varies. We match you with students targeting your specific school. You decide which requests to accept.',
  },
  {
    q: 'What if I gave bad advice and a student doesn\'t get in?',
    a: 'You\'re sharing your story, not guaranteeing outcomes. Students book for authentic insight — not promises. We make this clear in our terms.',
  },
  {
    q: 'Can I pause or stop anytime?',
    a: 'Yes. You can pause your profile or stop accepting sessions at any time with no penalty.',
  },
];

type FormState = {
  name: string;
  email: string;
  university: string;
  major: string;
  graduationYear: string;
  highSchool: string;
  activities: string;
  whyJoin: string;
};

const EMPTY: FormState = {
  name: '', email: '', university: '', major: '',
  graduationYear: '', highSchool: '', activities: '', whyJoin: '',
};

export default function ApplyPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Become an AdmitPeer Volunteer</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
          You got into your dream school. Now share how you did it — and give a low-income student the same shot you had. No payment. Just impact.
        </p>
      </div>

      {/* Perks */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {PERKS.map(perk => (
          <div key={perk.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <perk.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">{perk.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{perk.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Application form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Apply to volunteer</CardTitle>
              <p className="text-sm text-muted-foreground">Takes about 3 minutes. We review all applications within 48 hours.</p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Application submitted!</p>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                      We&apos;ll review your application and get back to you at <strong>{form.email}</strong> within 48 hours.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setForm(EMPTY); setSubmitted(false); }}>
                    Submit another application
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Full name *</label>
                      <Input required placeholder="Your name" value={form.name} onChange={update('name')} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Email *</label>
                      <Input required type="email" placeholder="your@email.com" value={form.email} onChange={update('email')} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium">University you were admitted to *</label>
                    <Input required placeholder="e.g. Stanford University" value={form.university} onChange={update('university')} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Major / intended major *</label>
                      <Input required placeholder="e.g. Computer Science" value={form.major} onChange={update('major')} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Graduation year *</label>
                      <Input required placeholder="e.g. 2028" value={form.graduationYear} onChange={update('graduationYear')} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium">High school *</label>
                    <Input required placeholder="Name of your high school" value={form.highSchool} onChange={update('highSchool')} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium">Top 3–5 activities / achievements *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Robotics team captain, USACO Gold, founded coding nonprofit…"
                      value={form.activities}
                      onChange={update('activities')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium">Why do you want to volunteer? *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What do you wish you'd known? What would you tell a first-gen student applying to your school right now?"
                      value={form.whyJoin}
                      onChange={update('whyJoin')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-2">
                    Submit Application
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By applying you agree to our volunteer guidelines. We&apos;ll never ask you to guarantee admission.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ sidebar */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-foreground">Frequently asked questions</h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="shrink-0 text-muted-foreground text-lg leading-none">
                    {expandedFaq === i ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === i && (
                  <>
                    <Separator />
                    <p className="px-4 py-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
