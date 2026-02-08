import type { Major } from "../types";
import { getRequiredCourseIds } from "../utils/planUtils";

interface ProgressBarProps {
  major: Major | null;
  completedIds: string[];
}

export function ProgressBar({ major, completedIds }: ProgressBarProps) {
  if (!major) return null;

  const requiredIds = getRequiredCourseIds(major);
  if (requiredIds.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
        <span className="font-medium">Course list not in app.</span> See the{" "}
        <a
          href="https://catalog.ucdavis.edu/departments-programs-degrees/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          General Catalog
        </a>{" "}
        for requirements and plan with your advisor.
      </div>
    );
  }

  const completed = completedIds.filter((id) => requiredIds.includes(id)).length;
  const total = requiredIds.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ucd-aggie">Progress toward {major.name} requirements</span>
        <span className="text-sm font-semibold text-ucd-aggie">
          {completed} of {total} courses ({pct}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${completed} of ${total} required courses completed`}
        />
      </div>
    </div>
  );
}
