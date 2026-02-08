import type { Major, Quarter } from "../types";
import { courses } from "../data/courses";

/** All course IDs required by a major (flattened, no duplicates). */
export function getRequiredCourseIds(major: Major): string[] {
  const ids = new Set<string>();
  for (const req of major.requirements) {
    for (const cid of req.courseIds) ids.add(cid);
  }
  return [...ids];
}

/** Course IDs still needed given completed set. */
export function getRemainingCourseIds(major: Major, completedIds: string[]): string[] {
  const required = getRequiredCourseIds(major);
  const completed = new Set(completedIds);
  return required.filter((id) => !completed.has(id));
}

/** Total units still needed (only counting required courses not completed). */
export function getRemainingUnits(major: Major, completedIds: string[]): number {
  const remaining = getRemainingCourseIds(major, completedIds);
  return remaining.reduce((sum, id) => {
    const c = courses.find((x) => x.id === id);
    return sum + (c?.units ?? 0);
  }, 0);
}

/** Quarters from a starting point (e.g. Fall 2025 -> Winter 2026 -> Spring 2026 -> Fall 2026). */
const SEASON_ORDER = ["fall", "winter", "spring", "summer"] as const;

export function getQuarterLabel(season: (typeof SEASON_ORDER)[number], year: number): string {
  const names: Record<(typeof SEASON_ORDER)[number], string> = {
    fall: "Fall",
    winter: "Winter",
    spring: "Spring",
    summer: "Summer",
  };
  return `${names[season]} ${year}`;
}

export function generateQuarters(
  startLabel: string,
  count: number
): { season: (typeof SEASON_ORDER)[number]; year: number }[] {
  const match = startLabel.match(/^(Fall|Winter|Spring|Summer)\s*(\d{4})$/i);
  const startSeason = match
    ? (match[1].toLowerCase() as (typeof SEASON_ORDER)[number])
    : "fall";
  const startYear = match ? parseInt(match[2], 10) : new Date().getFullYear();
  let idx = SEASON_ORDER.indexOf(startSeason);
  let year = startYear;
  const out: { season: (typeof SEASON_ORDER)[number]; year: number }[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ season: SEASON_ORDER[idx], year });
    idx += 1;
    if (idx >= SEASON_ORDER.length) {
      idx = 0;
      year += 1;
    }
  }
  return out;
}

/** Estimate number of quarters to finish remaining courses at ~12–16 units/quarter. */
export function estimateQuartersRemaining(
  major: Major,
  completedIds: string[],
  unitsPerQuarter: number = 14
): number {
  const units = getRemainingUnits(major, completedIds);
  return Math.max(1, Math.ceil(units / unitsPerQuarter));
}

/** Current quarter (UC Davis: Fall ~Sept, Winter ~Jan, Spring ~Mar, Summer ~June). */
export function getCurrentQuarter(): { season: (typeof SEASON_ORDER)[number]; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 9) return { season: "fall", year };
  if (month >= 6) return { season: "summer", year };
  if (month >= 3) return { season: "spring", year };
  if (month >= 1) return { season: "winter", year };
  return { season: "fall", year: year - 1 };
}

/** Add N quarters to a starting quarter; result is always in the future if start is current or future. */
export function addQuartersTo(
  start: { season: (typeof SEASON_ORDER)[number]; year: number },
  count: number
): { season: (typeof SEASON_ORDER)[number]; year: number } {
  let idx = SEASON_ORDER.indexOf(start.season);
  let y = start.year;
  for (let i = 0; i < count; i++) {
    idx += 1;
    if (idx >= SEASON_ORDER.length) {
      idx = 0;
      y += 1;
    }
  }
  return { season: SEASON_ORDER[idx], year: y };
}

/** Create empty quarter objects for the plan. */
export function createEmptyQuarters(
  startLabel: string,
  count: number
): Omit<Quarter, "courseIds">[] {
  return generateQuarters(startLabel, count).map((q, i) => ({
    id: `q-${i}`,
    label: getQuarterLabel(q.season, q.year),
    season: q.season,
    year: q.year,
  }));
}

/** 16 quarters for 4-year plan: Fall, Winter, Spring, Summer × 4 years. */
export function getFourYearQuarters(startYear: number): Omit<Quarter, "courseIds">[] {
  const out: Omit<Quarter, "courseIds">[] = [];
  for (let y = 0; y < 4; y++) {
    const year = startYear + y;
    for (const season of SEASON_ORDER) {
      out.push({
        id: `fy-${year}-${season}`,
        label: getQuarterLabel(season, year),
        season,
        year,
      });
    }
  }
  return out;
}

/** Next quarter after the given one (e.g. Summer 2028 → Fall 2029). */
export function getNextQuarterAfter(last: Quarter): Omit<Quarter, "courseIds"> {
  const idx = SEASON_ORDER.indexOf(last.season);
  const nextIdx = idx + 1;
  const nextYear = nextIdx >= SEASON_ORDER.length ? last.year + 1 : last.year;
  const nextSeason = SEASON_ORDER[nextIdx % SEASON_ORDER.length];
  return {
    id: `fy-${nextYear}-${nextSeason}`,
    label: getQuarterLabel(nextSeason, nextYear),
    season: nextSeason,
    year: nextYear,
  };
}

/** Short label for a quarter: "Fall 25", "Winter 26", etc. */
export function getQuarterShortLabel(season: (typeof SEASON_ORDER)[number], year: number): string {
  const names: Record<(typeof SEASON_ORDER)[number], string> = {
    fall: "Fall",
    winter: "Winter",
    spring: "Spring",
    summer: "Summer",
  };
  const shortYear = year % 100;
  return `${names[season]} ${shortYear}`;
}

/** Current and next quarter only (for schedule builder default). */
export function getCurrentAndNextQuarters(): Omit<Quarter, "courseIds">[] {
  const cur = getCurrentQuarter();
  const next = addQuartersTo(cur, 1);
  return [
    {
      id: `fy-${cur.year}-${cur.season}`,
      label: getQuarterLabel(cur.season, cur.year),
      season: cur.season,
      year: cur.year,
    },
    {
      id: `fy-${next.year}-${next.season}`,
      label: getQuarterLabel(next.season, next.year),
      season: next.season,
      year: next.year,
    },
  ];
}

/** Topological order of course IDs respecting prerequisites (no prereqs first). */
function topologicalSort(courseIds: string[]): string[] {
  const idSet = new Set(courseIds);
  const visited = new Set<string>();
  const result: string[] = [];
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const c = courses.find((x) => x.id === id);
    if (c?.prerequisites) {
      for (const p of c.prerequisites) {
        if (idSet.has(p)) visit(p);
      }
    }
    result.push(id);
  };
  for (const id of courseIds) visit(id);
  return result;
}

/** Whether a course is offered in the given quarter season. */
export function isCourseOfferedInQuarter(
  courseId: string,
  season: Quarter["season"]
): boolean {
  const c = courses.find((x) => x.id === courseId);
  if (!c?.typicallyOffered?.length) return true;
  return c.typicallyOffered.includes(season);
}

const MAX_UNITS_PER_QUARTER = 18;

/**
 * AI-assisted auto-fill: build a 4-year plan for the major that respects
 * prerequisites and UC Davis quarter offerings (catalog data).
 */
export function autoFillPlan(major: Major | null, startYear: number): Quarter[] {
  const poolIds =
    major && getRequiredCourseIds(major).length > 0
      ? getRequiredCourseIds(major)
      : [
          "mat21a", "mat21b", "ecn1a", "ecn1b", "uwp001", "bis2a", "bis2b", "bis2c",
          "sta013", "psy001", "che2a", "che2b", "che2c", "ecs36a", "ecs36b", "mat22a",
          "uwp101",
        ];
  const ordered = topologicalSort(poolIds);
  const quarters: Quarter[] = getFourYearQuarters(startYear).map((q) => ({
    ...q,
    courseIds: [] as string[],
  }));

  const quarterIndex = (q: Quarter) => quarters.findIndex((x) => x.id === q.id);

  for (const courseId of ordered) {
    const c = courses.find((x) => x.id === courseId);
    if (!c) continue;
    const prereqIds = c.prerequisites ?? [];
    for (const q of quarters) {
      const idx = quarterIndex(q);
      const quarterUnits = q.courseIds.reduce(
        (sum, id) => sum + (courses.find((x) => x.id === id)?.units ?? 0),
        0
      );
      if (quarterUnits + c.units > MAX_UNITS_PER_QUARTER) continue;
      const offered =
        !c.typicallyOffered?.length || c.typicallyOffered.includes(q.season);
      if (!offered) continue;
      const prereqsPlaced = prereqIds.every((pid) =>
        quarters.some(
          (oq, oidx) => oidx < idx && oq.courseIds.includes(pid)
        )
      );
      if (!prereqsPlaced) continue;
      q.courseIds.push(courseId);
      break;
    }
  }

  return quarters;
}
