import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              AdmitPeer
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Real advice from real students who just got in.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Students</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/advisors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find an Advisor</Link></li>
              <li><Link href="/match" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find My Match</Link></li>
              <li><Link href="/knowledge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Knowledge Base</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Volunteers</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Volunteer</Link></li>
              <li><Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Volunteer FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Mission</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#access-fund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Access Fund</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 AdmitPeer. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 fill-primary text-primary" />
            Free for students. Volunteer advisors. Equal access to college guidance.
          </p>
        </div>
      </div>
    </footer>
  );
}
