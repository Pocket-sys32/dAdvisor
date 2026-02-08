import type { Quarter } from "../types";
import { courses } from "../data/courses";
import { getRemainingCourseIds, getRequiredCourseIds } from "../utils/planUtils";
import type { Major } from "../types";

interface QuarterPlannerProps {
  targetMajor: Major | null;
  completedIds: string[];
  quarters: Quarter[];
  onQuartersChange: (quarters: Quarter[]) => void;
}

export function QuarterPlanner({
  targetMajor,
  completedIds,
  quarters,
  onQuartersChange,
}: QuarterPlannerProps) {
  const remainingIds = targetMajor
    ? getRemainingCourseIds(targetMajor, completedIds)
    : [];
  const remainingCourses = remainingIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as typeof courses;
  const hasCourseData = targetMajor && getRequiredCourseIds(targetMajor).length > 0;

  const setCourseInQuarter = (quarterId: string, courseId: string | null, slot: number) => {
    const newQuarters = quarters.map((q) => {
      if (q.id !== quarterId) return q;
      const next = [...q.courseIds];
      if (courseId !== null) {
        next[slot] = courseId;
      } else {
        next.splice(slot, 1);
      }
      return { ...q, courseIds: next.filter(Boolean) };
    });
    onQuartersChange(newQuarters);
  };

  const addSlot = (quarterId: string) => {
    const newQuarters = quarters.map((q) =>
      q.id === quarterId ? { ...q, courseIds: [...q.courseIds, ""] } : q
    );
    onQuartersChange(newQuarters);
  };

  const removeSlot = (quarterId: string, index: number) => {
    const newQuarters = quarters.map((q) => {
      if (q.id !== quarterId) return q;
      const next = q.courseIds.filter((_, i) => i !== index);
      return { ...q, courseIds: next };
    });
    onQuartersChange(newQuarters);
  };

  if (!targetMajor) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
        Select a target major and mark completed courses to plan quarters.
      </div>
    );
  }
  if (!hasCourseData) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        Quarter planning uses course lists from the app. For this major, see the{" "}
        <a href="https://catalog.ucdavis.edu/departments-programs-degrees/" target="_blank" rel="noopener noreferrer" className="underline">
          General Catalog
        </a>{" "}
        and plan with your advisor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ucd-aggie">Plan your quarters</h3>
      <p className="text-sm text-gray-600">
        Assign remaining required courses to quarters. Typical load: 12–16 units per quarter.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quarters.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 font-medium text-ucd-aggie">{q.label}</div>
            <div className="space-y-2">
              {q.courseIds.map((cid, idx) => (
                <div key={`${q.id}-${idx}`} className="flex items-center gap-2">
                  <select
                    value={cid || ""}
                    onChange={(e) =>
                      setCourseInQuarter(q.id, e.target.value || null, idx)
                    }
                    className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="">—</option>
                    {remainingCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} ({c.units})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSlot(q.id, idx)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSlot(q.id)}
                className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-ucd-gold hover:text-ucd-aggie"
              >
                + Add course
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {q.courseIds.reduce((sum, cid) => {
                const c = courses.find((x) => x.id === cid);
                return sum + (c?.units ?? 0);
              }, 0)}{" "}
              units
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
