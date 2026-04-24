/**
 * Health record — extracted from pediatrician notes by the Development quadrant.
 */
export interface HealthRecord {
  id: string;
  userId: string;
  childId: string;
  recordType: "well_child" | "sick_visit" | "specialist" | "dental" | "school_report" | "other";
  recordDate: string; // ISO date
  provider: string | null;
  summary: string;
  sourceContent: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Growth data point — extracted from health records.
 */
export interface GrowthDataPoint {
  id: string;
  healthRecordId: string;
  childId: string;
  ageMonths: number;
  weightLbs: number | null;
  weightPercentile: number | null;
  heightInches: number | null;
  heightPercentile: number | null;
  headCircumferenceCm: number | null;
  bmi: number | null;
  measuredAt: string; // ISO date
}

/**
 * Extraction result from Claude for the Development quadrant.
 */
export interface HealthExtraction {
  recordType: HealthRecord["recordType"];
  recordDate: string;
  provider: string | null;
  summary: string;
  growthData: {
    weightLbs: number | null;
    weightPercentile: number | null;
    heightInches: number | null;
    heightPercentile: number | null;
    headCircumferenceCm: number | null;
    bmi: number | null;
  } | null;
  milestones: {
    name: string;
    category: "motor" | "language" | "social" | "cognitive";
    status: "achieved" | "emerging" | "not_yet";
  }[];
  immunizations: {
    name: string;
    date: string | null;
  }[];
  concerns: string[];
  nextSteps: string[];
}
