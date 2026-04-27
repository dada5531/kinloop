/**
 * Activity — extracted from social links by the Play Lab quadrant.
 */
export interface Activity {
  id: string;
  userId: string;
  childId: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourcePlatform: "youtube" | "instagram" | "tiktok" | "pinterest" | "other";
  ageRangeMin: number; // months
  ageRangeMax: number; // months
  durationMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  category: "sensory" | "art" | "stem" | "outdoor" | "cooking" | "music" | "movement" | "other";
  steps: string[];
  materials: Material[];
  skills: string[];
  safetyNotes: string[];
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  name: string;
  quantity: string | null;
  amazonUrl: string | null; // Affiliate link from PA-API
  estimatedPrice: number | null;
  required: boolean;
}

/**
 * Extraction result from Claude for the Play Lab quadrant.
 */
export interface ActivityExtraction {
  title: string;
  description: string;
  ageRangeMin: number;
  ageRangeMax: number;
  durationMinutes: number;
  difficulty: Activity["difficulty"];
  category: Activity["category"];
  steps: string[];
  materials: {
    name: string;
    quantity: string | null;
    required: boolean;
  }[];
  skills: string[];
  safetyNotes: string[];
}
