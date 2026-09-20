import {
  collection, addDoc, query, where, onSnapshot, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type QACategory =
  | 'essay'
  | 'major'
  | 'interview'
  | 'activities'
  | 'school-specific'
  | 'general';

export type QACategoryMeta = {
  label: string;
  bg: string;
  text: string;
};

export const CATEGORY_META: Record<QACategory, QACategoryMeta> = {
  essay:             { label: 'Essay Advice',        bg: '#EDE9FE', text: '#5B21B6' },
  major:             { label: 'Major & School',       bg: '#DBEAFE', text: '#1D4ED8' },
  interview:         { label: 'Interview Prep',       bg: '#FEF3C7', text: '#92400E' },
  activities:        { label: 'Activities & Awards',  bg: '#D1FAE5', text: '#065F46' },
  'school-specific': { label: 'School Deep Dive',     bg: '#FFE4E6', text: '#9F1239' },
  general:           { label: 'General Advice',       bg: '#F1F5F9', text: '#475569' },
};

export type QASubmission = {
  id: string;
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
  studentId: string;
  studentName: string;
  category: QACategory;
  question: string;
  answer?: string;
  answeredAt?: string;
  submittedAt: string;
  status: 'pending' | 'answered';
  helpful: number;
  tags: string[];
};

// Legacy alias used by knowledge base search
export type QAEntry = QASubmission & { answer: string };
export type LocalQASubmission = QASubmission;

export async function submitQuestion(params: {
  advisorId: string;
  advisorName: string;
  advisorUniversityShort: string;
  studentId: string;
  studentName: string;
  category: QACategory;
  question: string;
}): Promise<void> {
  await addDoc(collection(db, 'qa_submissions'), {
    ...params,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    helpful: 0,
    tags: [],
  });
}

export async function answerQuestion(
  id: string,
  answer: string,
  tags: string[] = [],
): Promise<void> {
  await updateDoc(doc(db, 'qa_submissions', id), {
    answer,
    tags,
    status: 'answered',
    answeredAt: new Date().toISOString(),
  });
}

export function subscribeToAdvisorQA(
  advisorId: string,
  callback: (submissions: QASubmission[]) => void,
): () => void {
  const q = query(collection(db, 'qa_submissions'), where('advisorId', '==', advisorId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as QASubmission)));
  }, () => callback([]));
}

// Stubs retained so knowledge base page compiles without changes
export const SEED_QA: QAEntry[] = [];
export function getSeedQAForAdvisor(_id: string): QAEntry[] { return []; }
export function getLocalSubmissions(_id?: string): LocalQASubmission[] { return []; }
export function saveLocalSubmission(_s: unknown): void {}
export function searchKB(_q: string, _cat: QACategory | 'all'): QAEntry[] { return []; }
