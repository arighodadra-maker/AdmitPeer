'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap, Menu, X, CalendarDays, MessageCircle,
  User, LayoutDashboard, LogOut, ChevronDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { subscribeToUpcomingCount } from '@/lib/sessions';
import { subscribeToUnread } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loaded, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) { setSessionCount(0); return; }
    const unsub = subscribeToUpcomingCount(user.id, setSessionCount);
    return unsub;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setUnreadCount(0); return; }
    const unsub = subscribeToUnread(user.id, setUnreadCount);
    return unsub;
  }, [user?.id]);

  // Click-outside handler for user dropdown
  useEffect(() => {
    if (!userMenuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const links = [
    { href: '/match',     label: 'Find My Match'   },
    { href: '/advisors',  label: 'Browse Advisors' },
    { href: '/knowledge', label: 'Knowledge Base'  },
  ];

  const initials = user
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>AdmitPeer</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith(l.href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {l.label}
            </Link>
          ))}

          {/* My Sessions — auth only */}
          {loaded && user && (
            <Link
              href="/calendar"
              className={cn(
                'relative flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith('/calendar') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              My Sessions
              {sessionCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sessionCount > 9 ? '9+' : sessionCount}
                </span>
              )}
            </Link>
          )}

          {/* Messages icon — auth only */}
          {loaded && user && (
            <Link
              href="/messages"
              className={cn(
                'relative flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                pathname.startsWith('/messages') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <MessageCircle className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth: user dropdown or sign in */}
          {loaded && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.photoDataUrl} alt={user?.name} />
                  <AvatarFallback className={cn(user?.avatarColor ?? 'bg-primary', 'text-white text-xs font-bold')}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" /> My Profile
                    </Link>
                    {user.role === 'mentor' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Mentor Dashboard
                      </Link>
                    )}
                    <Link
                      href="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" /> Messages
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : loaded ? (
            <div className="flex items-center gap-2">
              <ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink>
              <ButtonLink href="/apply" size="sm">Become a Volunteer</ButtonLink>
            </div>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 sm:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname.startsWith(l.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {l.label}
              </Link>
            ))}
            {loaded && user && (
              <Link
                href="/calendar"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                  pathname.startsWith('/calendar') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <CalendarDays className="h-4 w-4" />
                My Sessions
                {sessionCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground leading-none">
                    {sessionCount}
                  </span>
                )}
              </Link>
            )}
            {loaded && user && (
              <Link
                href="/messages"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                  pathname.startsWith('/messages') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <MessageCircle className="h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {loaded && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
                {user.role === 'mentor' && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : loaded ? (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                  Sign in
                </ButtonLink>
                <ButtonLink href="/apply" size="sm" className="w-full" onClick={() => setMobileOpen(false)}>
                  Become a Volunteer
                </ButtonLink>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
