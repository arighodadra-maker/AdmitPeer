export type SessionType = {
  type: string;
  duration: string;
  description: string;
};

export type Advisor = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  university: string;
  universityShort: string;
  major: string;
  graduationYear: number;
  highSchool: string;
  location: string;
  gpa: string;
  sat: number;
  activities: string[];
  bio: string;
  sessions: SessionType[];
  rating: number;
  totalSessions: number;
  tags: string[];
  featured: boolean;
};

export const advisors: Advisor[] = [];

export const DEFAULT_SESSIONS: SessionType[] = [
  { type: 'Story Session',    duration: '45 min', description: 'Hear the full story of how I got in.' },
  { type: 'Essay Review',     duration: '60 min', description: 'Live feedback on your draft essays.' },
  { type: 'Strategy Session', duration: '60 min', description: 'Activity list, course selection, and timeline planning.' },
];

// Comprehensive static university list for the match flow (independent of advisor data)
export const universities = [
  'Harvard University', 'Yale University', 'Princeton University', 'Columbia University',
  'University of Pennsylvania', 'Brown University', 'Dartmouth College', 'Cornell University',
  'Stanford University', 'MIT', 'Caltech', 'Duke University', 'Northwestern University',
  'Johns Hopkins University', 'Georgetown University', 'Rice University', 'Vanderbilt University',
  'University of Notre Dame', 'Washington University in St. Louis', 'Emory University',
  'Tufts University', 'NYU', 'Carnegie Mellon University', 'University of Southern California',
  'Northeastern University', 'Boston University', 'Boston College', 'Tulane University',
  'UC Berkeley', 'UCLA', 'UC San Diego', 'UC Davis', 'UC Santa Barbara',
  'University of Michigan', 'University of Virginia', 'UNC Chapel Hill',
  'University of Wisconsin-Madison', 'University of Illinois Urbana-Champaign',
  'UT Austin', 'Georgia Tech',
  'Williams College', 'Amherst College', 'Swarthmore College', 'Wellesley College',
  'Pomona College', 'Bowdoin College', 'Colby College', 'Middlebury College',
  'Davidson College', 'Hamilton College', 'Vassar College', 'Colgate University',
  'Wake Forest University', 'Fordham University', 'George Washington University',
  'Case Western Reserve University', 'Villanova University', 'Purdue University',
  'University of Florida', 'Barnard College', 'University of Rochester',
].sort();

export function getAdvisorById(id: string): Advisor | undefined {
  return advisors.find(a => a.id === id);
}

export function getFeaturedAdvisors(): Advisor[] {
  return advisors.filter(a => a.featured);
}

export function searchAdvisors(query: string): Advisor[] {
  const q = query.toLowerCase();
  return advisors.filter(a =>
    a.university.toLowerCase().includes(q) ||
    a.universityShort.toLowerCase().includes(q) ||
    a.major.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  );
}

const AVAILABILITY_POOL = [
  { days: 'Weekdays after 4 PM',          tz: 'PST', next: 'Available this week'   },
  { days: 'Weekends',                      tz: 'EST', next: 'Next available: Sat'   },
  { days: 'Weekday evenings',              tz: 'CST', next: 'Available this week'   },
  { days: 'Fri – Sun',                     tz: 'PST', next: 'Available tomorrow'    },
  { days: 'Mon / Wed / Fri evenings',      tz: 'EST', next: 'Available this week'   },
  { days: 'Weekends + Wed evenings',       tz: 'MST', next: 'Next available: Sun'   },
  { days: 'Tue / Thu afternoons',          tz: 'PST', next: 'Available this week'   },
  { days: 'Weekends',                      tz: 'CST', next: 'Next available: Sat'   },
];

export type AdvisorAvailability = { days: string; tz: string; next: string };

export function getAdvisorAvailability(id: string): AdvisorAvailability {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  return AVAILABILITY_POOL[Math.abs(hash) % AVAILABILITY_POOL.length];
}
