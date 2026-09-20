'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  subscribeToUserConversations, markMessagesRead, sendMessage, getSenderName,
  type Conversation, type Message,
} from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MessageBubble({ msg, currentUserId, currentUserInitials }: {
  msg: Message;
  currentUserId: string;
  currentUserInitials: string;
}) {
  const outgoing = msg.fromId === currentUserId;
  const otherInitials = getSenderName(msg).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={cn('flex items-end gap-2', outgoing ? 'justify-end' : 'justify-start')}>
      {!outgoing && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-[10px] font-bold text-white bg-slate-500">
            {otherInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-0.5 max-w-[70%]', outgoing ? 'items-end' : 'items-start')}>
        <div className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          outgoing
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none',
        )}>
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.sentAt)}</span>
      </div>
      {outgoing && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-[10px] font-bold text-white bg-primary">
            {currentUserInitials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function ThreadView({
  conv, currentUserId, currentUserName, onBack,
}: {
  conv: Conversation;
  currentUserId: string;
  currentUserName: string;
  onBack: () => void;
}) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserInitials = currentUserName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const otherName = currentUserId === conv.advisorId ? conv.studentName : conv.advisorName;

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [conv.conversationId]);

  useEffect(() => {
    // Mark unread incoming messages as read whenever they're visible
    const unreadIds = conv.messages
      .filter(m => m.fromId !== currentUserId && !m.read)
      .map(m => m.id);
    markMessagesRead(unreadIds);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages.length, currentUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({
        studentId: conv.studentId,
        studentName: conv.studentName,
        advisorId: conv.advisorId,
        advisorName: conv.advisorName,
        advisorUniversityShort: conv.advisorUniversityShort,
        fromId: currentUserId,
        content: reply.trim(),
      });
      setReply('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {otherName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{otherName}</p>
          <p className="text-xs text-muted-foreground">{conv.advisorUniversityShort}</p>
        </div>
        <ButtonLink href={`/advisors/${conv.advisorId}`} variant="ghost" size="sm" className="ml-auto text-xs">
          View Profile
        </ButtonLink>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {conv.messages.map(m => (
          <MessageBubble
            key={m.id}
            msg={m}
            currentUserId={currentUserId}
            currentUserInitials={currentUserInitials}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <textarea
            rows={2}
            placeholder={`Reply to ${otherName}…`}
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
            }}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="sm" className="self-end shrink-0" disabled={!reply.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loaded } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loaded && !user) router.push('/login');
  }, [loaded, user, router]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserConversations(user.id, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [user?.id]);

  // Auto-select first conversation on desktop once data loads
  useEffect(() => {
    if (selectedId || conversations.length === 0) return;
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedId(conversations[0].conversationId);
    }
  }, [conversations.length, selectedId]);

  const selectedConv = selectedId
    ? conversations.find(c => c.conversationId === selectedId) ?? null
    : null;

  if (!loaded || !user) return null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-border bg-muted/30 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {conversations.length > 0
              ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
              : 'No conversations yet'}
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-lg font-semibold">No messages yet</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
              Browse advisors and send a message to start a conversation.
            </p>
          </div>
          <ButtonLink href="/advisors">Browse advisors</ButtonLink>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl">
          <div
            className="grid lg:grid-cols-[320px_1fr] border-b border-border"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            {/* Conversation list */}
            <div className={cn(
              'overflow-y-auto border-r border-border',
              selectedConv ? 'hidden lg:block' : 'block',
            )}>
              {conversations.map(conv => {
                const otherName = user.id === conv.advisorId ? conv.studentName : conv.advisorName;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedId(conv.conversationId)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-4 border-b border-border/60 hover:bg-muted/30 transition-colors text-left',
                      selectedConv?.conversationId === conv.conversationId && 'bg-primary/5 border-l-2 border-l-primary',
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {otherName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate">{otherName}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {lastMsg ? formatTime(lastMsg.sentAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.advisorUniversityShort}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {lastMsg?.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Thread panel */}
            <div className={cn(selectedConv ? 'block' : 'hidden lg:block')}>
              {selectedConv ? (
                <ThreadView
                  conv={selectedConv}
                  currentUserId={user.id}
                  currentUserName={user.name}
                  onBack={() => setSelectedId(null)}
                />
              ) : (
                <div className="flex h-full items-center justify-center flex-col gap-3 text-center px-8">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Select a conversation to read</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
