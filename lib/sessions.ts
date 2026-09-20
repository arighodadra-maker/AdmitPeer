import {
  collection, addDoc, query, where, onSnapshot,
  doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'declined';

export type BookedSession = {
  id: string;
  advisorId: string;
  advisorName: string;
  advisorInitials: string;
  advisorAvatarColor: string;
  advisorUniversity: string;
  advisorUniversityShort: string;
  sessionType: string;
  sessionDuration: string;
  dateISO: string;
  timeSlot: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  goal: string;
  status: SessionStatus;
  meetingLink?: string;
  createdAt?: string;
};

export async function saveSession(
  session: Omit<BookedSession, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...session,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export function subscribeToStudentSessions(
  studentId: string,
  callback: (sessions: BookedSession[]) => void,
): () => void {
  const q = query(collection(db, 'sessions'), where('studentId', '==', studentId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookedSession)));
  }, () => callback([]));
}

export function subscribeToAdvisorSessions(
  advisorId: string,
  callback: (sessions: BookedSession[]) => void,
): () => void {
  const q = query(collection(db, 'sessions'), where('advisorId', '==', advisorId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookedSession)));
  }, () => callback([]));
}

export async function updateSessionStatus(id: string, status: SessionStatus): Promise<void> {
  await updateDoc(doc(db, 'sessions', id), { status });
}

export async function deleteSession(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', id));
}

export function subscribeToUpcomingCount(
  studentId: string,
  callback: (count: number) => void,
): () => void {
  const q = query(collection(db, 'sessions'), where('studentId', '==', studentId));
  return onSnapshot(q, (snap) => {
    const today = new Date().toISOString().split('T')[0];
    const count = snap.docs.filter(d => (d.data() as BookedSession).dateISO >= today).length;
    callback(count);
  }, () => callback(0));
}
