import { ArrowRight, Star, Heart, Sparkles, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Separator } from '@/components/ui/separator';
import AdvisorCard from '@/components/AdvisorCard';
import { getFeaturedAdvisors } from '@/lib/data';

const STATS = [
  { value: '500+', label: 'students helped' },
  { value: '40+', label: 'universities covered' },
  { value: '4.9★', label: 'average rating' },
  { value: '100% free', label: 'for students' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Find your advisor',
    body: 'Search by your target university or use our matcher to get personalized recommendations.',
  },
  {
    step: '2',
    title: 'Ask anything',
    body: 'Browse advisor Q&A threads, search the knowledge base, or book a 1-on-1 session — all free.',
  },
  {
    step: '3',
    title: 'Knowledge stays',
    body: 'Questions asked publicly become part of our growing knowledge base — so every answer helps the next student too.',
  },
];

const COMPARISON = [
  { feature: 'Cost', admitpeer: 'Free', others: '$11,000–$200,000+' },
  { feature: 'Advisor recency', admitpeer: 'Admitted this year', others: '10–20 years removed' },
  { feature: 'School specificity', admitpeer: 'Exact school, exact year', others: 'Generic guidance' },
  { feature: 'Authenticity', admitpeer: 'Real student, real story', others: 'Professional consultant' },
  { feature: 'Flexibility', admitpeer: 'Schedule any time', others: 'Fixed packages' },
];

const TESTIMONIALS = [
  {
    quote: 'My advisor got into Stanford CS last year and completely changed how I was thinking about my application. I never could have gotten this advice from a professional counselor.',
    name: 'Jamie L.',
    school: 'Now at Stanford',
    initials: 'JL',
    color: 'bg-violet-500',
  },
  {
    quote: "I couldn't afford a real counselor. This was the first time I talked to anyone who had actually been through what I was going through — and it was free.",
    name: 'Carlos M.',
    school: 'Now at UC Berkeley',
    initials: 'CM',
    color: 'bg-emerald-500',
  },
  {
    quote: "My session with an MIT volunteer completely changed my 'Why MIT' essay. She told me which parts admissions rolls their eyes at. No other service could do that.",
    name: 'Leila K.',
    school: 'Now at MIT',
    initials: 'LK',
    color: 'bg-sky-500',
  },
];

// Mini preview card shown in the hero
function HeroPreviewCard() {
  return (
    <div className="w-72 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-violet-400 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-white/30">
            PS
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm">Priya Sharma</p>
            <p className="text-xs text-indigo-200 truncate">Computer Science</p>
            <span className="mt-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">Stanford</span>
          </div>
          <div className="shrink-0">
            <span className="inline-flex rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">Free</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-200">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-white">4.9</span>
          <span>(31 sessions)</span>
        </div>
        <p className="text-xs text-indigo-200 leading-relaxed line-clamp-2">
          "I was deferred EA before getting in RD. I know what it feels like and what actually works..."
        </p>
        <div className="flex gap-1.5">
          {['CS', 'STEM', 'Deferred→Admitted'].map(t => (
            <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-indigo-100">{t}</span>
          ))}
        </div>
        <div className="h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-semibold text-white">
          View Profile & Book →
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const featuredAdvisors = getFeaturedAdvisors();

  return (
    <div className="flex flex-col">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900 text-white">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,92,246,0.3),transparent)]" />
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 sm:px-6">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Now live at Harvard-Westlake · Expanding nationwide
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Get advice from someone who{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
                  actually got in
                </span>
              </h1>
              <p className="mt-5 text-lg text-indigo-200 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Book free 1-on-1 sessions with volunteer students admitted to your target university this year. Real stories, school-specific insight — at no cost.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <ButtonLink href="/match" size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold px-7 shadow-lg shadow-black/20">
                  <Sparkles className="mr-2 h-4 w-4" /> Find My Match
                </ButtonLink>
                <ButtonLink href="/advisors" size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
                  Browse Advisors <ArrowRight className="ml-2 h-4 w-4" />
                </ButtonLink>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-indigo-300">
                {['100% free for students', 'Volunteer advisors', '40+ universities'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: preview card */}
            <div className="hidden lg:flex shrink-0 items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-xl" />
                <HeroPreviewCard />
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live now
                </div>
                <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-lg">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 avg rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {STATS.map(s => (
              <div key={s.label} className="px-6 py-3 text-center first:pl-0 last:pr-0">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Simple process</p>
            <h2 className="text-3xl font-bold tracking-tight">Up and running in minutes</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connector line (desktop) */}
            <div className="absolute top-6 left-1/6 right-1/6 hidden h-px bg-border sm:block" style={{ left: '20%', right: '20%' }} />
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="relative flex flex-col items-center text-center gap-4 sm:items-start sm:text-left">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 z-10">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Match CTA banner ───────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left sm:gap-10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">Not sure where to start?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-lg">
              Tell us your dream school and interests. We rank advisors by how closely they match — and show you exactly why each one fits.
            </p>
          </div>
          <ButtonLink href="/match" size="lg" className="shrink-0 shadow-md shadow-primary/20">
            Find My Match <Sparkles className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      <Separator />

      {/* ── Featured advisors ──────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Featured</p>
              <h2 className="text-3xl font-bold tracking-tight">Meet your advisors</h2>
            </div>
            <ButtonLink href="/advisors" variant="ghost" className="hidden sm:inline-flex text-sm">
              See all 40 advisors <ArrowRight className="ml-1.5 h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAdvisors.map(advisor => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <ButtonLink href="/advisors" variant="outline">
              See all 40 advisors <ArrowRight className="ml-1.5 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Comparison table ───────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Why us</p>
            <h2 className="text-3xl font-bold tracking-tight">Free. Fresh. School-specific.</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Traditional counselors charge thousands for advice that's a decade out of date. Our volunteers just lived it — and they give back for free.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  <th className="py-3.5 px-5 text-left font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="py-3.5 px-5 text-left font-semibold text-primary w-1/3">AdmitPeer</th>
                  <th className="py-3.5 px-5 text-left font-medium text-muted-foreground w-1/3">Traditional Counselors</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="py-3.5 px-5 font-medium text-foreground">{row.feature}</td>
                    <td className="py-3.5 px-5 text-primary font-semibold">{row.admitpeer}</td>
                    <td className="py-3.5 px-5 text-muted-foreground">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Students</p>
            <h2 className="text-3xl font-bold tracking-tight">What students say</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map(i => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.color} text-white text-xs font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-primary font-medium">{t.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Access Fund ────────────────────────────────────────────────── */}
      <section id="access-fund" className="px-4 py-20 sm:px-6 bg-muted/20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 shadow-sm">
              <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-500 mb-2">Social impact</p>
          <h2 className="text-3xl font-bold tracking-tight">The AdmitPeer Access Fund</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
            AdmitPeer was built specifically for first-generation and low-income students who can't access traditional counseling. Every session is free. Every volunteer gives back. Equal access to the guidance that changes outcomes.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { stat: '72%', desc: 'of first-gen students received no college prep' },
              { stat: '1:500', desc: 'avg school counselor to student ratio' },
              { stat: '27%', desc: 'first-gen 4-yr graduation rate vs 60%+ for others' },
            ].map(item => (
              <div key={item.stat} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-2xl font-bold text-rose-500">{item.stat}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Advisor recruitment ─────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">For college students</p>
            <h2 className="text-3xl font-bold tracking-tight">Give back. Share your story.</h2>
            <p className="mt-3 text-muted-foreground">Volunteer a few hours a semester to help students the way you wish someone had helped you</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { icon: Heart, title: 'Make a real difference', body: 'Your story is exactly what a high school student needs to hear right now. A single conversation can change an application.' },
              { icon: Shield, title: 'No experience needed', body: 'You got in. That\'s the qualification. We help you set up your profile and prep for your first session.' },
              { icon: TrendingUp, title: 'Flexible commitment', body: 'Volunteer on your schedule. Accept only the sessions you want — no minimum, no pressure.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/apply" size="lg" className="shadow-md shadow-primary/20">
              Apply to Volunteer <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900 px-4 py-20 sm:px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(139,92,246,0.25),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to talk to someone who got in?</h2>
          <p className="mt-4 text-indigo-200 text-lg">Pick your dream school. Get matched. Book in minutes.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/match" size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold px-8 shadow-lg shadow-black/20">
              <Sparkles className="mr-2 h-4 w-4" /> Find My Match
            </ButtonLink>
            <ButtonLink href="/advisors" size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
              Browse Advisors
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
