import type { Major, MajorRequirement } from "../types";
import { courses } from "../data/courses";

interface RequirementsViewProps {
  major: Major | null;
  completedIds: string[];
  /** For requirements with no courseIds (e.g. CE "5 additional", "senior design"), allow manual check-off. */
  checkedRequirementIds?: string[];
  onToggleRequirement?: (requirementId: string) => void;
  /** Toggle a course completed (so you can check off in the requirement blocks below the progress bar). */
  onToggleCourse?: (courseId: string) => void;
}

function RequirementBlock({
  req,
  completedIds,
  checkedRequirementIds,
  onToggleRequirement,
  onToggleCourse,
}: {
  req: MajorRequirement;
  completedIds: string[];
  checkedRequirementIds?: string[];
  onToggleRequirement?: (requirementId: string) => void;
  onToggleCourse?: (courseId: string) => void;
}) {
  const completed = new Set(completedIds);
  const list = req.choose
    ? req.courseIds.slice(0, req.choose + req.courseIds.length)
    : req.courseIds;
  const isCheckable = list.length === 0 && onToggleRequirement != null;
  const isChecked = isCheckable && (checkedRequirementIds?.includes(req.id) ?? false);
  const canToggleCourse = onToggleCourse != null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700/50">
      <div className="mb-2 font-semibold text-ucd-aggie dark:text-ucd-gold">{req.name}</div>
      {req.description && (
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{req.description}</p>
      )}
      {isCheckable ? (
        <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-600/50">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggleRequirement?.(req.id)}
            className="mt-0.5 h-4 w-4 rounded border-gray-400 text-ucd-gold focus:ring-ucd-gold"
          />
          <span className={isChecked ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-gray-200"}>
            Mark as completed when satisfied
          </span>
        </label>
      ) : (
        <ul className="space-y-1.5">
          {list.map((courseId) => {
            const course = courses.find((c) => c.id === courseId);
            const done = completed.has(courseId);
            if (!course) return null;
            return (
              <li key={courseId}>
                {canToggleCourse ? (
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-600/50 ${
                      done
                        ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300"
                        : "text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => onToggleCourse(courseId)}
                      className="h-4 w-4 shrink-0 rounded border-gray-400 text-green-600 focus:ring-green-500"
                      aria-label={`${course.code} ${done ? "completed" : "not completed"}`}
                    />
                    <span className="font-mono">{course.code}</span>
                    <span>{course.name}</span>
                    <span className={done ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>({course.units} units)</span>
                  </label>
                ) : (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                      done
                        ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300"
                        : "text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        done ? "border-green-600 bg-green-600 text-white" : "border-gray-400 dark:border-gray-500"
                      }`}
                      aria-hidden
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="font-mono">{course.code}</span>
                    <span>{course.name}</span>
                    <span className={done ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>({course.units} units)</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {req.choose != null && !isCheckable && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Choose {req.choose} from list</p>
      )}
    </div>
  );
}

export function RequirementsView({
  major,
  completedIds,
  checkedRequirementIds,
  onToggleRequirement,
  onToggleCourse,
}: RequirementsViewProps) {
  if (!major) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
        Select a target major to see requirements.
      </div>
    );
  }

  const isCE = major.id === "computer-engineering-bs";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
        {major.name} ({major.degree}) – {major.college}
      </h3>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {major.requirements.map((req) => (
          <RequirementBlock
            key={req.id}
            req={req}
            completedIds={completedIds}
            checkedRequirementIds={isCE ? checkedRequirementIds : undefined}
            onToggleRequirement={isCE ? onToggleRequirement : undefined}
            onToggleCourse={onToggleCourse}
          />
        ))}
      </div>
    </div>
  );
}
