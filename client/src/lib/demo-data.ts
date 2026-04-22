/**
 * KINLOOP Demo Data — Seed data for HBS presentation
 * Family: Jenn (parent) + Mia (age 4y 2mo)
 */

export interface Child {
  id: string;
  name: string;
  dob: string;
  age: string;
  gender: string;
  photoUrl: string;
  allergies: string[];
  medications: string[];
  schoolName: string;
  teacherName: string;
  pediatricianName: string;
  pediatricianPhone: string;
  notes: string;
}

export interface SchedulerEvent {
  id: string;
  childId: string;
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  sourceType: 'email' | 'pdf' | 'paste';
  sourceLabel: string;
  actionItems: string[];
  amountDue?: { what: string; amount: number; dueDate: string; payee: string };
  status: 'pending' | 'approved' | 'dismissed';
  confidence: number;
  rawContent: string;
  replyDraft?: string;
}

export interface HealthRecord {
  id: string;
  childId: string;
  visitDate: string;
  type: 'well-visit' | 'sick' | 'school_report' | 'dental';
  summary: string;
  details: Record<string, string | number>;
  nextAction?: string;
}

export interface GrowthEntry {
  date: string;
  ageMonths: number;
  weight: number;
  height: number;
  weightPercentile: number;
  heightPercentile: number;
}

export interface Activity {
  id: string;
  childId: string;
  sourceUrl: string;
  sourcePlatform: 'youtube' | 'tiktok' | 'instagram' | 'pinterest';
  title: string;
  materials: { name: string; qty: number; estPrice: number }[];
  durationMinutes: number;
  ageMin: number;
  ageMax: number;
  skillsDeveloped: string[];
  steps: string[];
  safetyNotes: string[];
  messinessScore: number;
  scheduledFor?: string;
  saved: boolean;
  thumbnailUrl?: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { book: string; chapter: string }[];
  timestamp: string;
}

export interface CoachTopic {
  id: string;
  title: string;
  description: string;
  ageBucket: string;
  icon: string;
}

// ─── Demo Family ───────────────────────────────────────────

export const demoParent = {
  id: 'parent-1',
  name: 'Jenn',
  email: 'jenn@kinloop.app',
};

export const demoChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Mia',
    dob: '2022-02-15',
    age: '4y 2mo',
    gender: 'female',
    photoUrl: '',
    allergies: ['Tree nuts'],
    medications: [],
    schoolName: 'Bright Horizons Preschool',
    teacherName: 'Ms. Rodriguez',
    pediatricianName: 'Dr. Sarah Chen',
    pediatricianPhone: '(617) 555-0142',
    notes: 'Loves dinosaurs and painting. Working on letter recognition.',
  },
];

// ─── Quadrant 1: Scheduler Events ─────────────────────────

export const demoSchedulerEvents: SchedulerEvent[] = [
  {
    id: 'evt-1',
    childId: 'child-1',
    title: 'Picture Day',
    startTime: '2026-05-05T09:00:00',
    endTime: '2026-05-05T12:00:00',
    location: 'Bright Horizons Preschool — Main Hall',
    sourceType: 'email',
    sourceLabel: 'Email from Bright Horizons',
    actionItems: [
      'Choose outfit the night before',
      'Sign and return photo package order form by May 2',
      'Payment: $35 for deluxe package',
    ],
    amountDue: { what: 'Photo package (deluxe)', amount: 35, dueDate: '2026-05-02', payee: 'Bright Horizons' },
    status: 'pending',
    confidence: 0.95,
    rawContent: `Dear Bright Horizons Families,\n\nPicture Day is coming! Our photographer will be at the school on Monday, May 5th from 9:00 AM to 12:00 PM in the Main Hall.\n\nPlease return the enclosed photo package order form with payment by Friday, May 2nd. The deluxe package is $35 and includes class photos.\n\nDress code: Please have your child wear solid colors (no logos or characters).\n\nBest,\nMs. Rodriguez\nBright Horizons Preschool`,
    replyDraft: `Hi Ms. Rodriguez,\n\nThank you for the reminder! We'll have Mia's form and payment ready by May 2nd. Looking forward to picture day!\n\nBest,\nJenn`,
  },
  {
    id: 'evt-2',
    childId: 'child-1',
    title: 'Field Trip to Children\'s Museum',
    startTime: '2026-05-12T08:30:00',
    endTime: '2026-05-12T14:00:00',
    location: 'Boston Children\'s Museum',
    sourceType: 'pdf',
    sourceLabel: 'Permission slip (PDF)',
    actionItems: [
      'Sign permission slip and return by May 8',
      'Pack nut-free lunch and snack',
      'Chaperone spots available — sign up by May 6',
    ],
    amountDue: { what: 'Field trip fee', amount: 15, dueDate: '2026-05-08', payee: 'Bright Horizons' },
    status: 'pending',
    confidence: 0.92,
    rawContent: `FIELD TRIP PERMISSION SLIP\n\nDestination: Boston Children's Museum\nDate: Monday, May 12, 2026\nDeparture: 8:30 AM from school\nReturn: 2:00 PM\n\nCost: $15 per child (includes admission and bus)\n\nPlease sign below and return with payment by May 8th.\n\nWe need 4 parent chaperones. If interested, please sign up by May 6th.\n\nIMPORTANT: Pack a nut-free lunch and snack. No glass containers.\n\nParent/Guardian Signature: _______________\nDate: _______________`,
  },
  {
    id: 'evt-3',
    childId: 'child-1',
    title: 'Updated Sick Policy',
    startTime: '2026-04-28T00:00:00',
    sourceType: 'email',
    sourceLabel: 'Email from school admin',
    actionItems: [
      'Review updated fever policy: 24-hour symptom-free before return',
      'Update emergency contacts if changed',
      'Note: COVID testing no longer required for mild symptoms',
    ],
    status: 'approved',
    confidence: 0.88,
    rawContent: `Dear Families,\n\nWe're writing to share an update to our illness policy, effective April 28, 2026.\n\nKey changes:\n- Children must be fever-free (under 100.4°F) for 24 hours without medication before returning to school\n- COVID testing is no longer required for mild cold symptoms\n- Please update your emergency contact information if anything has changed\n\nFull policy attached. Questions? Contact the front office.\n\nThank you,\nBright Horizons Administration`,
  },
];

// ─── Quadrant 2: Health Records ───────────────────────────

export const demoHealthRecords: HealthRecord[] = [
  {
    id: 'hr-1',
    childId: 'child-1',
    visitDate: '2026-03-10',
    type: 'well-visit',
    summary: '4-year well-child visit. All developmental milestones on track. Vaccinations up to date. Growth tracking at 65th percentile for height, 55th for weight.',
    details: {
      height: '40.5 inches',
      weight: '36.2 lbs',
      heightPercentile: 65,
      weightPercentile: 55,
      bmi: 15.5,
      vision: '20/30 — normal for age',
      hearing: 'Passed',
      vaccinations: 'DTaP (4th dose), IPV (3rd dose) — up to date',
      bloodPressure: '95/58 — normal',
      nextVisit: '5-year well-child visit (Feb 2027)',
    },
    nextAction: 'Schedule 5-year well-child visit in February 2027. Continue monitoring vision — recheck at next visit.',
  },
  {
    id: 'hr-2',
    childId: 'child-1',
    visitDate: '2026-04-01',
    type: 'school_report',
    summary: 'Spring progress report from Ms. Rodriguez. Mia is excelling in social-emotional development and creative arts. Working on letter recognition and fine motor skills (pencil grip). Recommended: practice writing letters at home.',
    details: {
      socialEmotional: 'Exceeds expectations — shares well, resolves conflicts with words',
      language: 'Meets expectations — strong vocabulary, tells stories with detail',
      literacy: 'Approaching expectations — recognizes 15/26 letters, working on name writing',
      math: 'Meets expectations — counts to 20, sorts by shape and color',
      fineMotor: 'Approaching expectations — developing pencil grip, cuts with scissors',
      grossMotor: 'Exceeds expectations — runs, jumps, climbs confidently',
      teacherNote: 'Mia is a joy in the classroom! She has a wonderful imagination and is a natural leader during group activities. I recommend practicing letter tracing and pencil grip exercises at home to support her fine motor development.',
    },
    nextAction: 'Practice letter tracing at home. Consider fine motor activities (playdough, bead stringing). Parent-teacher conference scheduled for May 20.',
  },
];

export const demoGrowthData: GrowthEntry[] = [
  { date: '2022-02-15', ageMonths: 0, weight: 7.5, height: 19.5, weightPercentile: 50, heightPercentile: 55 },
  { date: '2022-04-15', ageMonths: 2, weight: 11.2, height: 22.0, weightPercentile: 52, heightPercentile: 58 },
  { date: '2022-06-15', ageMonths: 4, weight: 14.1, height: 24.5, weightPercentile: 55, heightPercentile: 60 },
  { date: '2022-08-15', ageMonths: 6, weight: 16.5, height: 26.0, weightPercentile: 53, heightPercentile: 58 },
  { date: '2022-11-15', ageMonths: 9, weight: 19.0, height: 28.0, weightPercentile: 50, heightPercentile: 55 },
  { date: '2023-02-15', ageMonths: 12, weight: 21.0, height: 29.5, weightPercentile: 48, heightPercentile: 53 },
  { date: '2023-08-15', ageMonths: 18, weight: 24.5, height: 32.0, weightPercentile: 50, heightPercentile: 55 },
  { date: '2024-02-15', ageMonths: 24, weight: 27.5, height: 34.5, weightPercentile: 52, heightPercentile: 58 },
  { date: '2024-08-15', ageMonths: 30, weight: 30.0, height: 36.5, weightPercentile: 53, heightPercentile: 60 },
  { date: '2025-02-15', ageMonths: 36, weight: 32.5, height: 38.0, weightPercentile: 55, heightPercentile: 62 },
  { date: '2025-08-15', ageMonths: 42, weight: 34.5, height: 39.5, weightPercentile: 54, heightPercentile: 63 },
  { date: '2026-03-10', ageMonths: 49, weight: 36.2, height: 40.5, weightPercentile: 55, heightPercentile: 65 },
];

// ─── Quadrant 3: Activities ──────────────────────────────

export const demoActivities: Activity[] = [
  {
    id: 'act-1',
    childId: 'child-1',
    sourceUrl: 'https://www.tiktok.com/@busytoddler/video/example1',
    sourcePlatform: 'tiktok',
    title: 'Rainbow Rice Sensory Bin',
    materials: [
      { name: 'White rice (2 cups)', qty: 1, estPrice: 2.50 },
      { name: 'Food coloring set', qty: 1, estPrice: 4.99 },
      { name: 'Plastic bin (large)', qty: 1, estPrice: 8.99 },
      { name: 'Scoops and cups', qty: 1, estPrice: 5.99 },
      { name: 'Ziplock bags', qty: 1, estPrice: 3.49 },
    ],
    durationMinutes: 45,
    ageMin: 2,
    ageMax: 6,
    skillsDeveloped: ['Sensory exploration', 'Fine motor skills', 'Color recognition', 'Pouring & scooping'],
    steps: [
      'Divide rice into 6 ziplock bags (about 1/3 cup each)',
      'Add 5-10 drops of food coloring to each bag with 1 tsp vinegar',
      'Seal and shake until evenly colored',
      'Spread on baking sheets to dry (30 min)',
      'Pour all colors into the plastic bin',
      'Add scoops, cups, and small toys for exploration',
    ],
    safetyNotes: ['Supervise to prevent eating', 'Not suitable for children who still mouth objects frequently'],
    messinessScore: 4,
    saved: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop',
  },
  {
    id: 'act-2',
    childId: 'child-1',
    sourceUrl: 'https://www.tiktok.com/@playathomemom/video/example2',
    sourcePlatform: 'tiktok',
    title: 'DIY Dinosaur Excavation',
    materials: [
      { name: 'Small dinosaur toys', qty: 6, estPrice: 9.99 },
      { name: 'Baking soda (2 boxes)', qty: 2, estPrice: 2.00 },
      { name: 'Water', qty: 1, estPrice: 0 },
      { name: 'Vinegar (spray bottle)', qty: 1, estPrice: 3.49 },
      { name: 'Paintbrushes', qty: 3, estPrice: 4.99 },
      { name: 'Muffin tin', qty: 1, estPrice: 7.99 },
    ],
    durationMinutes: 60,
    ageMin: 3,
    ageMax: 7,
    skillsDeveloped: ['Scientific thinking', 'Fine motor skills', 'Patience', 'Paleontology vocabulary'],
    steps: [
      'Mix baking soda with small amount of water to form a paste',
      'Press dinosaur toys into muffin tin cups',
      'Cover with baking soda paste and pack tightly',
      'Freeze overnight (or 4+ hours)',
      'Pop out frozen dino eggs',
      'Give child vinegar spray bottle and brushes to excavate',
    ],
    safetyNotes: ['Vinegar may irritate eyes — use spray bottle carefully', 'Wash hands after play'],
    messinessScore: 3,
    saved: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=300&fit=crop',
  },
];

// ─── Quadrant 4: Coach ───────────────────────────────────

export const demoCoachConversation: CoachMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Mia has been having tantrums at bedtime. She screams and cries when we say it\'s time for bed. What can we do?',
    timestamp: '2026-04-18T20:30:00',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `This is very common for 4-year-olds, and you're not alone. At this age, children are developing a stronger sense of autonomy and may resist transitions, especially to activities they don't choose (like bedtime). Here are some evidence-based strategies:\n\n**1. Give advance warnings and choices**\nInstead of a sudden "time for bed," try a countdown: "We have 10 minutes left, then 5, then 2." Offering small choices ("Do you want the dinosaur pajamas or the star ones?") gives Mia a sense of control within the boundary you've set.\n\n**2. Create a predictable routine**\nA consistent sequence — bath → teeth → 2 books → lights out — helps the brain anticipate what's coming. Siegel and Bryson call this "building the upstairs brain" through predictability.\n\n**3. Name the feeling, then redirect**\nWhen Mia screams, try: "You're really upset because you don't want playtime to end. I understand. AND it's time for your body to rest." This "connect and redirect" approach validates her emotion without giving in to the demand.\n\n**4. Consider a "bedtime pass"**\nResearch shows giving children one "free pass" to leave their room once (for water, a hug, etc.) actually reduces bedtime resistance because it gives them agency.\n\nThe key insight: tantrums at this age aren't manipulation — they're a sign that the emotional brain is overwhelmed and the rational brain hasn't fully developed yet. Your calm presence IS the regulation tool she needs.`,
    sources: [
      { book: 'The Whole-Brain Child', chapter: 'Ch. 2: Connect and Redirect' },
      { book: 'No-Drama Discipline', chapter: 'Ch. 5: 1-2-3 Discipline' },
      { book: 'How to Talk So Kids Will Listen', chapter: 'Ch. 1: Acknowledging Feelings' },
    ],
    timestamp: '2026-04-18T20:30:15',
  },
];

export const demoCoachTopics: CoachTopic[] = [
  {
    id: 'topic-1',
    title: 'Preparing for kindergarten',
    description: 'What skills to focus on and how to build school readiness at home',
    ageBucket: '3-5',
    icon: 'GraduationCap',
  },
  {
    id: 'topic-2',
    title: 'Managing big emotions',
    description: 'Helping your preschooler develop emotional regulation',
    ageBucket: '3-5',
    icon: 'Heart',
  },
  {
    id: 'topic-3',
    title: 'Screen time boundaries',
    description: 'Evidence-based guidelines for media use at age 4',
    ageBucket: '3-5',
    icon: 'Monitor',
  },
  {
    id: 'topic-4',
    title: 'Picky eating strategies',
    description: 'How to expand food acceptance without power struggles',
    ageBucket: '3-5',
    icon: 'Utensils',
  },
  {
    id: 'topic-5',
    title: 'Building friendships',
    description: 'Supporting social development and navigating peer conflicts',
    ageBucket: '3-5',
    icon: 'Users',
  },
  {
    id: 'topic-6',
    title: 'Fine motor development',
    description: 'Activities to strengthen hand muscles for writing readiness',
    ageBucket: '3-5',
    icon: 'Pencil',
  },
];

// ─── Cross-quadrant context ──────────────────────────────

export interface ContextInsight {
  id: string;
  type: 'scheduler' | 'development' | 'play' | 'coach';
  title: string;
  description: string;
  relatedQuadrant: string;
}

export const demoContextInsights: ContextInsight[] = [
  {
    id: 'ctx-1',
    type: 'development',
    title: 'Fine motor focus',
    description: 'Ms. Rodriguez flagged pencil grip in the spring report. Play Lab has boosted activities with fine motor components.',
    relatedQuadrant: 'play',
  },
  {
    id: 'ctx-2',
    type: 'scheduler',
    title: 'Field trip prep',
    description: 'Museum field trip on May 12. Coach has tips on making museum visits educational for 4-year-olds.',
    relatedQuadrant: 'coach',
  },
  {
    id: 'ctx-3',
    type: 'coach',
    title: 'Bedtime follow-up',
    description: 'You discussed bedtime tantrums 4 days ago. How is the bedtime pass working?',
    relatedQuadrant: 'coach',
  },
];
