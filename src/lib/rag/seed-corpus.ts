/**
 * Seed corpus — curated parenting knowledge for the Coach RAG pipeline.
 *
 * Sources:
 *   - AAP (American Academy of Pediatrics) guidelines
 *   - "The Whole-Brain Child" by Daniel J. Siegel & Tina Payne Bryson
 *   - "How to Talk So Kids Will Listen" by Adele Faber & Elaine Mazlish
 *   - "No-Drama Discipline" by Daniel J. Siegel & Tina Payne Bryson
 *   - "Healthy Sleep Habits, Happy Child" by Marc Weissbluth
 *   - "Child of Mine" by Ellyn Satter
 *   - "Thirty Million Words" by Dana Suskind
 *   - Harvard Center on the Developing Child
 *   - Montessori from the Start by Paula Polk Lillard
 *   - Busy Toddler by Susie Allison
 *
 * Run with: npx tsx src/lib/rag/seed-corpus.ts
 */

export interface CorpusChunk {
  content: string;
  source: string;
  source_url: string | null;
  category: string;
  age_bucket: string | null;
}

export const TIPS_CORPUS: CorpusChunk[] = [
  // Sleep
  {
    content:
      "When a toddler resists bedtime, the key is a consistent, predictable routine — not rigidity. A 3-step wind-down (bath, book, song) signals the brain that sleep is coming. Avoid screens for at least 30 minutes before bed, as blue light suppresses melatonin. If your child gets out of bed, calmly and silently walk them back without engaging in conversation. The first few nights may be hard, but consistency teaches them that bedtime is non-negotiable and safe.",
    source: "Healthy Sleep Habits, Happy Child by Marc Weissbluth",
    source_url: "https://www.amazon.com/Healthy-Sleep-Habits-Happy-Child/dp/0449004023",
    category: "sleep",
    age_bucket: "1-3",
  },
  {
    content:
      "For babies 4-6 months, a gentle sleep training approach involves putting them down drowsy but awake. This teaches self-soothing without full cry-it-out. The key window is when babies naturally develop the ability to self-soothe, usually around 4 months. Watch for sleep cues: rubbing eyes, yawning, fussiness. Missing the window leads to overtiredness, which paradoxically makes it harder to fall asleep.",
    source: "Precious Little Sleep by Alexis Dubief",
    source_url: "https://www.preciouslittlesleep.com",
    category: "sleep",
    age_bucket: "0-1",
  },
  {
    content:
      "Night wakings are normal and developmentally appropriate for children under 2. Rather than trying to eliminate them entirely, focus on helping your child learn to resettle. A brief check-in (pat on the back, quiet shushing) without picking up teaches them that you are nearby but that nighttime is for sleeping. Regression periods around 8, 12, 18, and 24 months are temporary and often linked to developmental leaps.",
    source: "The Sleep Lady's Good Night, Sleep Tight by Kim West",
    source_url: "https://sleeplady.com/good-night-sleep-tight-books-and-guides/",
    category: "sleep",
    age_bucket: "0-2",
  },

  // Nutrition
  {
    content:
      "Division of responsibility in feeding: the parent decides what, when, and where to eat; the child decides whether and how much. This approach, developed by Ellyn Satter, reduces mealtime battles and helps children develop a healthy relationship with food. Never force a child to clean their plate — this overrides their natural hunger and fullness cues. Offer the same meal to the whole family, including at least one food you know the child will eat.",
    source: "Child of Mine by Ellyn Satter",
    source_url: "https://www.ellynsatterinstitute.org/product/child-of-mine/",
    category: "nutrition",
    age_bucket: null,
  },
  {
    content:
      "Picky eating peaks between ages 2-6 and is a normal developmental phase. Children may need to be exposed to a new food 15-20 times before accepting it. Exposure means seeing, touching, smelling — not necessarily eating. Serve new foods alongside familiar ones without pressure. Model enjoyment of varied foods. Avoid making separate meals, but do include at least one safe food at each meal so the child can always eat something.",
    source: "French Kids Eat Everything by Karen Le Billon",
    source_url: "https://www.harpercollins.com/products/french-kids-eat-everything-karen-le-billon",
    category: "nutrition",
    age_bucket: "2-5",
  },
  {
    content:
      "When introducing solids (around 6 months), baby-led weaning offers soft finger foods instead of purees. This approach encourages self-feeding, develops fine motor skills, and may reduce picky eating later. Key safety rules: always supervise, avoid choking hazards (whole grapes, popcorn, raw carrots), and let the baby set the pace. Gagging is normal and different from choking — gagging is loud and the baby resolves it themselves; choking is silent.",
    source: "Baby-Led Weaning by Gill Rapley",
    source_url: "http://www.rapleyweaning.com",
    category: "nutrition",
    age_bucket: "0-1",
  },

  // Behavior / Discipline
  {
    content:
      "When your child has a meltdown, connect before you correct. Get down to their eye level, acknowledge their feeling ('You're really frustrated that we have to leave the park'), and wait for the emotional wave to pass before discussing behavior. The upstairs brain (rational thinking) goes offline during big emotions — no amount of reasoning will work until the child feels heard and safe. This is not permissiveness; it's neuroscience.",
    source: "The Whole-Brain Child by Daniel J. Siegel & Tina Payne Bryson",
    source_url: "https://drdansiegel.com/book/the-whole-brain-child/",
    category: "behavior",
    age_bucket: null,
  },
  {
    content:
      "Instead of saying 'Good job!' for everything, try specific encouragement: 'You worked really hard on that tower' or 'I noticed you shared your toy with your friend — that was kind.' Generic praise creates praise-dependent children; specific feedback builds intrinsic motivation and helps children understand exactly what they did well. Focus on effort and process, not outcome.",
    source: "How to Talk So Kids Will Listen by Adele Faber & Elaine Mazlish",
    source_url:
      "https://www.simonandschuster.com/books/How-to-Talk-So-Kids-Will-Listen-Listen-So-Kids-Will-Talk/Adele-Faber/The-How-To-Talk-Series/9781451663877",
    category: "behavior",
    age_bucket: null,
  },
  {
    content:
      "Natural consequences are the most effective teachers for children over 3. If they refuse to wear a coat, they feel cold (within safe limits). If they throw food, the meal is over. The parent's role is to set the boundary calmly and follow through consistently — not to lecture, threaten, or shame. 'I see you threw your food. That tells me you're done eating. We can try again at the next meal.' Brief, warm, firm.",
    source: "No-Drama Discipline by Daniel J. Siegel & Tina Payne Bryson",
    source_url: "https://drdansiegel.com/book/no-drama-discipline/",
    category: "behavior",
    age_bucket: "3-5",
  },
  {
    content:
      "Time-outs are less effective than time-ins for young children. Instead of isolating a child who is dysregulated, sit with them in a calm corner. Say: 'I can see you're having a hard time. I'm here with you.' This teaches co-regulation before self-regulation. Children learn to manage emotions by first experiencing someone managing emotions with them. Self-regulation develops gradually between ages 3-7.",
    source: "No-Drama Discipline by Daniel J. Siegel & Tina Payne Bryson",
    source_url: "https://drdansiegel.com/book/no-drama-discipline/",
    category: "behavior",
    age_bucket: "1-5",
  },

  // Development
  {
    content:
      "The most important thing you can do for your child's brain development in the first three years is talk to them — a lot. The landmark Hart and Risley study found that children who heard more words had larger vocabularies, higher IQs, and better school outcomes. But it's not just quantity; it's quality. Narrate your day ('Now I'm cutting the banana into slices'), ask open-ended questions, and pause for them to respond, even before they can talk.",
    source: "Thirty Million Words by Dana Suskind",
    source_url:
      "https://www.penguinrandomhouse.com/books/316983/thirty-million-words-by-dana-suskind-md/",
    category: "development",
    age_bucket: "0-3",
  },
  {
    content:
      "Serve-and-return interactions are the building blocks of brain architecture. When a baby babbles and you respond, when a toddler points and you name the object, when a child tells you a story and you ask a follow-up question — each exchange strengthens neural connections. The key is responsiveness: the child initiates, the adult responds, and the interaction goes back and forth. Even 5 minutes of focused serve-and-return is more valuable than an hour of parallel presence.",
    source: "Center on the Developing Child, Harvard University",
    source_url: "https://developingchild.harvard.edu",
    category: "development",
    age_bucket: "0-3",
  },
  {
    content:
      "Play is not a break from learning — it IS learning. Through pretend play, children develop executive function, emotional regulation, language skills, and theory of mind. A child who pretends a block is a phone is practicing symbolic thinking, the same cognitive skill needed for reading. Resist the urge to over-schedule structured activities. Unstructured, child-led play is where the deepest learning happens.",
    source: "The Power of Play by David Elkind",
    source_url: "https://www.amazon.com/Power-Play-Learning-Comes-Naturally/dp/0738211109",
    category: "development",
    age_bucket: null,
  },

  // Screen time
  {
    content:
      "The AAP recommends no screen time for children under 18 months (except video calls), and no more than 1 hour per day of high-quality programming for ages 2-5. But the research shows that what matters most is not just duration but context: Is the content age-appropriate and educational? Is a parent co-viewing and discussing what's on screen? Is screen time replacing physical play, reading, or social interaction? Co-viewing transforms passive consumption into active learning.",
    source: "American Academy of Pediatrics Guidelines",
    source_url: "https://www.aap.org",
    category: "screen-time",
    age_bucket: "0-5",
  },

  // Social-emotional
  {
    content:
      "Emotional literacy starts with naming feelings. When you say 'You look disappointed that your friend couldn't come over,' you're giving your child the vocabulary to understand and eventually manage their inner world. Children who can name their emotions are less likely to act them out physically. Keep a feelings chart visible, read books about emotions, and model your own emotional awareness: 'I'm feeling frustrated right now, so I'm going to take a deep breath.'",
    source: "Raising An Emotionally Intelligent Child by John Gottman",
    source_url: "https://www.gottman.com/product/raising-an-emotionally-intelligent-child-book/",
    category: "social-emotional",
    age_bucket: null,
  },
  {
    content:
      "Separation anxiety peaks around 8-10 months and again around 18 months. It's a sign of healthy attachment, not a problem to fix. The best approach: keep goodbyes brief and confident ('I'm going to work now. I'll be back after your nap. I love you!'), never sneak away (this erodes trust), and create a goodbye ritual (a special handshake, three kisses). The anxiety typically resolves within 10-15 minutes of the parent leaving.",
    source: "The Attachment Parenting Book by William Sears",
    source_url:
      "https://www.amazon.com/Attachment-Parenting-Book-Commonsense-Understanding/dp/0316778095",
    category: "social-emotional",
    age_bucket: "0-2",
  },

  // Safety
  {
    content:
      "Childproofing evolves with your child's development. At 6-9 months (crawling): cover outlets, gate stairs, secure furniture to walls. At 12-18 months (walking/climbing): lock cabinets with chemicals, move sharp objects up high, install window guards. At 2-3 years (opening doors, climbing everything): doorknob covers, toilet locks, move step stools away from counters. The most dangerous age for household injuries is 1-3 years, when mobility outpaces judgment.",
    source: "Caring for Your Baby and Young Child by AAP",
    source_url: "https://www.aap.org",
    category: "safety",
    age_bucket: "0-3",
  },
];

export interface ActivityCorpusItem {
  title: string;
  description: string;
  source: string;
  source_url: string | null;
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  materials: string[];
  steps: string[];
}

export const ACTIVITIES_CORPUS: ActivityCorpusItem[] = [
  {
    title: "Sensory Bin Exploration",
    description:
      "Fill a bin with dried rice or pasta and hide small toys inside. Let your child dig, pour, and discover. This develops fine motor skills, sensory processing, and early math concepts (full/empty, more/less).",
    source: "Busy Toddler by Susie Allison",
    source_url: "https://busytoddler.com",
    category: "sensory",
    age_min: 12,
    age_max: 36,
    duration_minutes: 20,
    materials: [
      "Large bin or container",
      "Dried rice or pasta",
      "Small toys or figurines",
      "Cups and spoons",
    ],
    steps: [
      "Fill the bin with dried rice or pasta",
      "Hide small toys throughout the bin",
      "Let your child explore freely — digging, pouring, scooping",
      "Name what they find and describe textures",
      "Introduce cups for pouring and transferring",
    ],
  },
  {
    title: "Nature Walk Scavenger Hunt",
    description:
      "Create a simple picture checklist of things to find outdoors: a leaf, a rock, something red, something soft. Walk together and check items off. Builds observation skills, vocabulary, and love of nature.",
    source: "Last Child in the Woods by Richard Louv",
    source_url: "https://richardlouv.com/books/last-child",
    category: "outdoor",
    age_min: 24,
    age_max: 60,
    duration_minutes: 30,
    materials: ["Paper and crayons for checklist", "Small bag for collecting treasures"],
    steps: [
      "Draw or print a simple picture checklist",
      "Walk together in a park or neighborhood",
      "Let your child lead — follow their curiosity",
      "Check off items as you find them",
      "Talk about what you see, hear, and smell",
    ],
  },
  {
    title: "Kitchen Helper: Banana Mashing",
    description:
      "Give your toddler a ripe banana and a fork. Let them mash it themselves. This builds hand strength, independence, and a positive relationship with food. Spread on toast together for a snack.",
    source: "Montessori from the Start by Paula Polk Lillard",
    source_url:
      "https://www.penguinrandomhouse.com/books/101545/montessori-from-the-start-by-paula-polk-lillard-and-lynn-lillard-jessen/",
    category: "practical-life",
    age_min: 12,
    age_max: 30,
    duration_minutes: 10,
    materials: ["Ripe banana", "Fork", "Small bowl", "Toast (optional)"],
    steps: [
      "Peel the banana together (let them help pull)",
      "Break into pieces in a bowl",
      "Show them how to press with a fork",
      "Let them mash independently",
      "Spread on toast or eat with a spoon",
    ],
  },
  {
    title: "Cardboard Box Fort",
    description:
      "Transform a large cardboard box into a fort, house, or spaceship. Cut windows and a door. Let your child decorate with crayons and stickers. Encourages imaginative play, spatial reasoning, and creative expression.",
    source: "The Artful Parent by Jean Van't Hul",
    source_url: "https://artfulparent.com",
    category: "creative",
    age_min: 24,
    age_max: 72,
    duration_minutes: 45,
    materials: [
      "Large cardboard box",
      "Scissors (adult use)",
      "Crayons or markers",
      "Stickers",
      "Blanket for inside",
    ],
    steps: [
      "Find a box big enough for your child to sit inside",
      "Cut a door and windows together (adult handles scissors)",
      "Let your child decorate the outside",
      "Add a blanket and pillow inside for coziness",
      "Follow their lead on what it becomes",
    ],
  },
  {
    title: "Water Pouring Station",
    description:
      "Set up cups, funnels, and containers at a low table with a tray of water. Let your child pour between containers. This Montessori-inspired activity develops concentration, hand-eye coordination, and understanding of volume.",
    source: "Montessori from the Start by Paula Polk Lillard",
    source_url:
      "https://www.penguinrandomhouse.com/books/101545/montessori-from-the-start-by-paula-polk-lillard-and-lynn-lillard-jessen/",
    category: "practical-life",
    age_min: 18,
    age_max: 48,
    duration_minutes: 15,
    materials: [
      "Small pitcher",
      "Cups of different sizes",
      "Funnel",
      "Tray to contain spills",
      "Towel",
    ],
    steps: [
      "Set up the tray on a low table or the floor",
      "Show your child how to pour slowly",
      "Let them practice — spills are part of learning",
      "Introduce the funnel for a new challenge",
      "Show them how to wipe up spills with the towel",
    ],
  },
  {
    title: "Story Stones",
    description:
      "Paint simple images on smooth rocks (sun, tree, cat, house, star). Take turns picking stones and building a story together. Develops narrative skills, creativity, and turn-taking.",
    source: "The Artful Parent by Jean Van't Hul",
    source_url: "https://artfulparent.com",
    category: "creative",
    age_min: 30,
    age_max: 72,
    duration_minutes: 30,
    materials: ["Smooth rocks (5-8)", "Acrylic paint or markers", "Clear sealant (optional)"],
    steps: [
      "Collect smooth, flat rocks on a nature walk",
      "Paint simple pictures on each rock",
      "Let the paint dry completely",
      "Put all stones in a bag",
      "Take turns drawing a stone and adding to the story",
    ],
  },
];
