import { useState, useMemo } from "react";
import type { Course } from "../types";
import { courses } from "../data/courses";
import { isCourseOfferedInQuarter } from "../utils/planUtils";

interface AddCourseModalProps {
  onClose: () => void;
  onSelectCourse: (courseId: string) => void;
  title: string;
  quarterSeason: "fall" | "winter" | "spring" | "summer";
  excludeCourseIds: string[];
}

export function AddCourseModal({
  onClose,
  onSelectCourse,
  title,
  quarterSeason,
  excludeCourseIds,
}: AddCourseModalProps) {
  const [search, setSearch] = useState("");

  const excluded = useMemo(() => new Set(excludeCourseIds), [excludeCourseIds]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses
      .filter((c) => !excluded.has(c.id))
      .filter(
        (c) =>
          !term ||
          c.code.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const aOffered = isCourseOfferedInQuarter(a.id, quarterSeason);
        const bOffered = isCourseOfferedInQuarter(b.id, quarterSeason);
        if (aOffered && !bOffered) return -1;
        if (!aOffered && bOffered) return 1;
        return a.code.localeCompare(b.code);
      });
  }, [search, excluded, quarterSeason]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
        aria-hidden
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
        role="dialog"
        aria-modal
        aria-labelledby="add-course-modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2
            id="add-course-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-ucd-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-ucd-gold/20"
            autoFocus
          />
        </div>

        <div className="max-h-[min(60vh,400px)] overflow-y-auto px-4 py-3">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {excluded.size === courses.length
                ? "All courses are already in this quarter."
                : "No courses match your search."}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredCourses.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  offeredThisQuarter={isCourseOfferedInQuarter(c.id, quarterSeason)}
                  onSelect={() => {
                    onSelectCourse(c.id);
                    onClose();
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/30 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function CourseRow({
  course,
  offeredThisQuarter,
  onSelect,
}: {
  course: Course;
  offeredThisQuarter: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-ucd-aggie/5 focus:bg-ucd-aggie/5 focus:outline-none focus:ring-2 focus:ring-ucd-gold/30"
      >
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm font-semibold text-ucd-aggie">
            {course.code}
          </div>
          <div className="truncate text-sm text-gray-600">{course.name}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-gray-500">{course.units} units</span>
          {offeredThisQuarter && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
              Offered
            </span>
          )}
        </div>
      </button>
    </li>
  );
}
