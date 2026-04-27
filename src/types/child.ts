/**
 * Child profile — the central entity in KINLOOP.
 * Every quadrant references a child to provide personalized context.
 */
export interface Child {
  id: string;
  userId: string;
  name: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  gender: "male" | "female" | "other" | null;
  interests: string[];
  allergies: string[];
  notes: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Computed child context used in Claude prompts.
 */
export interface ChildContext {
  child: Child;
  ageMonths: number;
  ageDisplay: string; // e.g., "4y 2mo"
}

export interface CreateChildInput {
  name: string;
  dob: string;
  gender?: "male" | "female" | "other";
  interests?: string[];
  allergies?: string[];
  notes?: string;
}
