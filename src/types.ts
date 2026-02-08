// UC Davis–style major transfer planning

export interface Course {
  id: string;
  code: string;       // e.g. "ECS 036A"
  name: string;
  units: number;
  description?: string;  // catalog description
  prerequisites?: string[];  // course ids
  typicallyOffered?: ("fall" | "winter" | "spring" | "summer")[];
}

export interface MajorRequirement {
  id: string;
  name: string;       // e.g. "Lower Division Core"
  description?: string;
  courseIds: string[];
  minUnits?: number;
  choose?: number;    // "choose N from list"
}

export interface Major {
  id: string;
  name: string;
  degree: "BA" | "BS";
  college: string;
  requirements: MajorRequirement[];
}

export interface CompletedCourse {
  courseId: string;
  quarter?: string;  // e.g. "Fall 2024"
  grade?: string;
}

export interface Quarter {
  id: string;
  label: string;     // e.g. "Fall 2025"
  season: "fall" | "winter" | "spring" | "summer";
  year: number;
  courseIds: string[];
}

export interface Plan {
  currentMajorId: string | null;
  targetMajorId: string | null;
  completedCourseIds: string[];
  quarters: Quarter[];
  startQuarter: string;  // e.g. "Fall 2025"
}
