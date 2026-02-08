import type { Major } from "../types";
import { courses } from "../data/courses";
import { getRequiredCourseIds } from "../utils/planUtils";

interface CompletedCoursesProps {
  targetMajor: Major | null;
  completedIds: string[];
  onChange: (ids: string[] | ((prev: string[]) => string[])) => void;
}

export function CompletedCourses({
  targetMajor,
  completedIds,
  onChange,
}: CompletedCoursesProps) {
  if (!targetMajor) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
        Select a target major to mark completed courses.
      </div>
    );
  }

  const requiredIds = getRequiredCourseIds(targetMajor);
  if (requiredIds.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        This major’s course list isn’t in the app. Check the{" "}
        <a href="https://catalog.ucdavis.edu/departments-programs-degrees/" target="_blank" rel="noopener noreferrer" className="underline">
          General Catalog
        </a>{" "}
        and track completed courses with your advisor.
      </div>
    );
  }

  const requiredCourses = requiredIds
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as typeof courses;

  const toggle = (courseId: string) => {
    onChange((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-ucd-aggie">
        Courses I’ve already completed (for {targetMajor.name})
      </h3>
      <p className="mb-3 text-sm text-gray-600">
        Check every course that you have passed. We’ll use this to compute how many quarters remain.
      </p>
      <div className="flex max-h-64 flex-wrap gap-x-4 gap-y-2 overflow-y-auto">
        {requiredCourses.map((c) => {
          const isCompleted = completedIds.includes(c.id);
          return (
            <label
              key={c.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
                isCompleted
                  ? "border-green-300 bg-green-100 hover:bg-green-200"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="font-mono">{c.code}</span>
              <span className={isCompleted ? "text-green-800" : "text-gray-600"}>({c.units})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
