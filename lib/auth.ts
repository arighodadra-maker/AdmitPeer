import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserRole = 'student' | 'mentor';
export type TranscriptStatus = 'pending' | 'verified' | 'rejected';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dreamColleges: string[];
  createdAt: string;
  highSchool?: string;
  photoDataUrl?: string;      // base64 profile photo stored inline in Firestore
  transcriptUrl?: string;     // legacy
  transcriptPath?: string;    // Firebase Storage path (large files)
  transcriptDataUrl?: string; // base64 data URL inline in Firestore (small files, fast upload)
  transcriptStatus?: TranscriptStatus;
  advisorId?: string;
  university?: string;
  universityShort?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  activities?: string[];
  tags?: string[];
  avatarColor?: string;
  initials?: string;
  rating?: number;
  totalSessions?: number;
  featured?: boolean;
  sessions?: { type: string; duration: string; description: string }[];
  profileComplete?: boolean;
};

const COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<AuthUser | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    return snap.exists() ? ({ id: uid, ...snap.data() } as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(uid: string, data: Omit<AuthUser, 'id'>): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), data, { merge: true });
}

export async function getMentors(): Promise<AuthUser[]> {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('role', '==', 'mentor'))
    );
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as AuthUser))
      .filter(u => u.profileComplete === true && u.university);
  } catch (e) {
    console.error('[AdmitPeer] getMentors failed — Firestore rules may be blocking reads:', e);
    return [];
  }
}
