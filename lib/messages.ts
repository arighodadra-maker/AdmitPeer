import {
  collection, addDoc, query, where, onSnapshot,
  writeBatch, doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Message = {
  id: string;
  conversationId: string;
  participants: string[];          // [studentId, advisorId]
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
  fromId: string;                  // who sent this message
  content: string;
  sentAt: string;                  // ISO
  read: boolean;
};

export type Conversation = {
  conversationId: string;
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
  studentId: string;
  studentName: string;
  messages: Message[];
  lastMessageAt: string;
  unreadCount: number;
};

export function makeConversationId(studentId: string, advisorId: string): string {
  return `${studentId}_${advisorId}`;
}

export function getSenderName(msg: Message): string {
  return msg.fromId === msg.advisorId ? msg.advisorName : msg.studentName;
}

export async function sendMessage(params: {
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
  fromId: string;
  content: string;
}): Promise<void> {
  const conversationId = makeConversationId(params.studentId, params.advisorId);
  await addDoc(collection(db, 'messages'), {
    conversationId,
    participants: [params.studentId, params.advisorId],
    studentId: params.studentId,
    studentName: params.studentName,
    advisorId: params.advisorId,
    advisorName: params.advisorName,
    advisorUniversityShort: params.advisorUniversityShort,
    fromId: params.fromId,
    content: params.content,
    sentAt: new Date().toISOString(),
    read: false,
  });
}

export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
): () => void {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
    const map = new Map<string, Message[]>();
    for (const m of msgs) {
      const arr = map.get(m.conversationId) ?? [];
      arr.push(m);
      map.set(m.conversationId, arr);
    }
    const convs: Conversation[] = Array.from(map.entries())
      .map(([convId, convMsgs]) => {
        const sorted = [...convMsgs].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
        const last = sorted[sorted.length - 1];
        return {
          conversationId: convId,
          advisorId: last.advisorId,
          advisorName: last.advisorName,
          advisorUniversityShort: last.advisorUniversityShort,
          studentId: last.studentId,
          studentName: last.studentName,
          messages: sorted,
          lastMessageAt: last.sentAt,
          unreadCount: convMsgs.filter(m => m.fromId !== userId && !m.read).length,
        };
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    callback(convs);
  }, (err) => {
    console.error('[AdmitPeer] subscribeToUserConversations error:', err);
    callback([]);
  });
}

export async function markMessagesRead(messageIds: string[]): Promise<void> {
  if (messageIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const id of messageIds) {
      batch.update(doc(db, 'messages', id), { read: true });
    }
    await batch.commit();
  } catch (e) {
    console.error('[AdmitPeer] markMessagesRead error:', e);
  }
}

export function subscribeToUnread(
  userId: string,
  callback: (count: number) => void,
): () => void {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
  );
  return onSnapshot(q, (snap) => {
    const count = snap.docs.filter(d => {
      const m = d.data() as Message;
      return m.fromId !== userId && !m.read;
    }).length;
    callback(count);
  }, () => callback(0));
}
