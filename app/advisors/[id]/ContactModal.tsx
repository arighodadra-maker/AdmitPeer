'use client';

import { useState } from 'react';
import { MessageCircle, CheckCircle2, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import type { Advisor } from '@/lib/data';
import { sendMessage } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';

type Props = { advisor: Advisor };

export default function ContactModal({ advisor }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const firstName = advisor.name.split(' ')[0];

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setSending(true);
    try {
      await sendMessage({
        studentId: user.id,
        studentName: user.name,
        advisorId: advisor.id,
        advisorName: advisor.name,
        advisorUniversityShort: advisor.universityShort,
        fromId: user.id,
        content: message.trim(),
      });
      setSent(true);
    } catch (err) {
      console.error('[AdmitPeer] Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setSent(false); setMessage(''); }, 300);
  }

  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Message {firstName}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="font-semibold text-foreground">Message {firstName}</p>
                <p className="text-xs text-muted-foreground">{advisor.university}</p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {!user ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in to message {firstName}.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
                    <ButtonLink href="/login" size="sm" onClick={handleClose}>Sign in</ButtonLink>
                  </div>
                </div>
              ) : sent ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Message sent!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {firstName} will see your message shortly.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
                    <ButtonLink href="/messages" size="sm" onClick={handleClose}>
                      View in Messages
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Have a quick question before booking? Send {firstName} a message.
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium">Your message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder={`Hi ${firstName}, I'm applying to ${advisor.universityShort} and I was wondering…`}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!message.trim() || sending}>
                    {sending
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                      : <><Send className="mr-2 h-4 w-4" />Send message</>
                    }
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Sending as <strong>{user.name}</strong> · Expect a reply within 24 hours
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
