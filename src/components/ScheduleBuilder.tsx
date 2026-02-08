import { useState, useMemo, useCallback } from "react";
import type { Quarter } from "../types";
import type { Major } from "../types";
import type { Course } from "../types";
import { courses } from "../data/courses";
import {
  getFourYearQuarters,
  getNextQuarterAfter,
  getQuarterShortLabel,
  autoFillPlan,
  isCourseOfferedInQuarter,
} from "../utils/planUtils";
import { CourseDetailModal } from "./CourseDetailModal";
import { AddCourseModal } from "./AddCourseModal";
import { CurrentQuarterDeadlines } from "./CurrentQuarterDeadlines";

/** Prereqs (ids) and successors (ids that list this course as prereq). */
function getRelatedCourseIds(courseId: string): { prereqs: string[]; successors: string[] } {
  const c = courses.find((x) => x.id === courseId);
  const prereqs = c?.prerequisites ?? [];
  const successors = courses
    .filter((x) => x.prerequisites?.includes(courseId))
    .map((x) => x.id);
  return { prereqs, successors };
}

interface ScheduleBuilderProps {
  currentMajorId: string | null;
  currentMajor: Major | null;
  currentMajorName: string | null;
  onCurrentMajorChange: (id: string | null) => void;
  oasisLastUpdated: string;
  majors: { id: string; name: string; degree: string }[];
  completedCourseIds: string[];
  onCompletedCourseIdsChange: (ids: string[]) => void;
  quarters: Quarter[];
  onQuartersChange: (quarters: Quarter[] | ((prev: Quarter[]) => Quarter[])) => void;
  startYear: number;
  onStartYearChange: (year: number) => void;
}

export function ScheduleBuilder({
  currentMajorId,
  currentMajor,
  currentMajorName,
  onCurrentMajorChange,
  oasisLastUpdated,
  majors,
  completedCourseIds,
  onCompletedCourseIdsChange,
  quarters,
  onQuartersChange,
  startYear,
  onStartYearChange,
}: ScheduleBuilderProps) {
  const currentYear = new Date().getFullYear();
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [addCourseModalQuarterId, setAddCourseModalQuarterId] = useState<string | null>(null);

  const completedSet = useMemo(() => new Set(completedCourseIds), [completedCourseIds]);

  const relatedToHover = useMemo(() => {
    if (!hoveredCourseId) return new Set<string>();
    const { prereqs, successors } = getRelatedCourseIds(hoveredCourseId);
    return new Set([...prereqs, ...successors]);
  }, [hoveredCourseId]);


  const totalPlannedUnits = useMemo(
    () =>
      quarters.reduce((sum, q) => {
        return (
          sum +
          q.courseIds.reduce(
            (s, id) =>
              s + (courses.find((c) => c.id === id)?.units ?? 0),
            0
          )
        );
      }, 0),
    [quarters]
  );

  const scheduledCourseIds = useMemo(
    () => new Set(quarters.flatMap((q) => q.courseIds)),
    [quarters]
  );
  const completedUnits = useMemo(() => {
    return completedCourseIds
      .filter((id) => scheduledCourseIds.has(id))
      .reduce((sum, id) => sum + (courses.find((c) => c.id === id)?.units ?? 0), 0);
  }, [completedCourseIds, scheduledCourseIds]);

  const addCourse = useCallback((quarterId: string, courseId: string) => {
    onQuartersChange((prev) =>
      prev.map((q) =>
        q.id === quarterId ? { ...q, courseIds: [...q.courseIds, courseId] } : q
      )
    );
  }, [onQuartersChange]);

  const removeCourse = useCallback((quarterId: string, courseId: string) => {
    onQuartersChange((prev) =>
      prev.map((q) =>
        q.id === quarterId
          ? { ...q, courseIds: q.courseIds.filter((id) => id !== courseId) }
          : q
      )
    );
  }, [onQuartersChange]);

  const moveCourse = useCallback(
    (sourceQuarterId: string, courseId: string, destQuarterId: string) => {
      if (sourceQuarterId === destQuarterId) return;
      onQuartersChange((prev) =>
        prev.map((q) => {
          if (q.id === sourceQuarterId)
            return { ...q, courseIds: q.courseIds.filter((id) => id !== courseId) };
          if (q.id === destQuarterId)
            return { ...q, courseIds: [...q.courseIds, courseId] };
          return q;
        })
      );
    },
    [onQuartersChange]
  );

  const handleTrashDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsTrashHovered(false);
      const data = e.dataTransfer.getData("text/plain");
      const [quarterId, courseId] = data.split("|");
      if (quarterId && courseId) removeCourse(quarterId, courseId);
    },
    [removeCourse]
  );

  const toggleCompletedCourse = useCallback(
    (courseId: string) => {
      onCompletedCourseIdsChange(
        completedCourseIds.includes(courseId)
          ? completedCourseIds.filter((id) => id !== courseId)
          : [...completedCourseIds, courseId]
      );
    },
    [completedCourseIds, onCompletedCourseIdsChange]
  );

  const updateStartYear = useCallback((year: number) => {
    onStartYearChange(year);
  }, [onStartYearChange]);

  const handleAutoFill = useCallback(() => {
    onQuartersChange(autoFillPlan(currentMajor, startYear));
  }, [currentMajor, startYear, onQuartersChange]);

  const addQuarter = useCallback(() => {
    const last = quarters[quarters.length - 1];
    if (!last) return;
    const next = getNextQuarterAfter(last);
    onQuartersChange((prev) => [...prev, { ...next, courseIds: [] }]);
  }, [quarters, onQuartersChange]);

  const removeQuarter = useCallback((quarterId: string) => {
    onQuartersChange((prev) => prev.filter((q) => q.id !== quarterId));
  }, [onQuartersChange]);

  return (
    <div className="space-y-6">
      {/* 4-year schedule — vertical quarters */}
      <div className="mx-auto w-full max-w-[min(1600px,96vw)] rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800 md:rounded-3xl md:p-6">
        <div className="border-b border-gray-100 px-4 py-5 md:px-6">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">
            4-year schedule
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Hover over a course to highlight prerequisites and follow-up courses. Add ~12–16 units per quarter.
          </p>
        </div>

        {/* Top bar: Legend + Trash + Add quarter (IlliniPlan-style) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/30 md:px-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Legend</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm border border-amber-400/60 bg-amber-50" aria-hidden />
                <span className="text-xs text-gray-600 dark:text-gray-400">Prerequisite of hovered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm bg-emerald-50 dark:bg-emerald-900/30" aria-hidden />
                <span className="text-xs text-gray-600 dark:text-gray-400">Scheduled</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setIsTrashHovered(true);
              }}
              onDragLeave={() => setIsTrashHovered(false)}
              onDrop={handleTrashDrop}
              className={`flex cursor-default items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 transition-colors ${
                isTrashHovered
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-500"
              }`}
              title="Drag a course here to remove it from your schedule"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-xs font-medium">Drop to remove</span>
            </div>
            <button
              type="button"
              onClick={addQuarter}
              className="rounded-xl bg-ucd-aggie px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-ucd-aggie/90"
            >
              + Add quarter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-6 lg:grid-cols-4 justify-items-start">
          {quarters.map((q) => (
            <div key={q.id} className="w-full max-w-[280px]">
            <QuarterCell
              key={q.id}
              quarter={q}
              courses={courses}
              completedCourseIds={completedSet}
              onToggleCompletedCourse={toggleCompletedCourse}
              onAddCourse={(courseId) => addCourse(q.id, courseId)}
              onRemoveCourse={(courseId) => removeCourse(q.id, courseId)}
              onMoveCourse={moveCourse}
              onRemoveQuarter={quarters.length > 2 ? removeQuarter : undefined}
              onOpenAddCourse={() => setAddCourseModalQuarterId(q.id)}
              onCourseClick={(course) => setSelectedCourse(course)}
              hoveredCourseId={hoveredCourseId}
              relatedCourseIds={relatedToHover}
              onHoverCourse={setHoveredCourseId}
            />
            </div>
          ))}
        </div>

        {/* Total planned & Completed credits — checkmarks on courses */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-8 border-t border-gray-100 px-4 py-4 md:px-6">
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-400">Completed</div>
            <div className="text-xl font-semibold tabular-nums text-emerald-600">{completedUnits} units</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-400">Total planned</div>
            <div className="text-xl font-semibold tabular-nums text-emerald-600">{totalPlannedUnits} units</div>
          </div>
        </div>
      </div>

      {/* Current quarter deadlines & dates */}
      <div className="mx-auto mt-8 max-w-6xl">
        <CurrentQuarterDeadlines />
      </div>

      {/* OASIS mock — moved to bottom */}
      <div className="mx-auto max-w-6xl rounded-2xl border border-gray-200/80 bg-white px-5 py-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ucd-aggie text-white shadow">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ucd-aggie">Your plan from OASIS</h2>
              <p className="text-sm text-gray-600">
                {currentMajorName ? `Major: ${currentMajorName}` : "Major: —"} · Units: 45 · Last synced {oasisLastUpdated}
              </p>
              <p className="mt-1 text-xs text-gray-500">(Mock data — edit above or use Auto-fill. Check off completed courses in the schedule.)</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Major</label>
              <select
                value={currentMajorId ?? ""}
                onChange={(e) => onCurrentMajorChange(e.target.value || null)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-ucd-aggie shadow-sm focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30"
              >
                <option value="">Select major…</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.degree})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Start year</label>
              <select
                value={startYear}
                onChange={(e) => updateStartYear(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-ucd-aggie shadow-sm focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30"
              >
                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="rounded-lg bg-ucd-aggie px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-ucd-aggie/90 focus:outline-none focus:ring-2 focus:ring-ucd-gold focus:ring-offset-2"
            >
              Auto-fill plan (AI)
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Auto-fill uses UC Davis catalog data: prerequisites and when courses are offered. Pick a major first for major-specific plans.
        </p>
      </div>

      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />

      {addCourseModalQuarterId && (() => {
        const q = quarters.find((x) => x.id === addCourseModalQuarterId);
        if (!q) return null;
        return (
          <AddCourseModal
            onClose={() => setAddCourseModalQuarterId(null)}
            onSelectCourse={(courseId) => addCourse(q.id, courseId)}
            title={`Add course to ${getQuarterShortLabel(q.season, q.year)}`}
            quarterSeason={q.season}
            excludeCourseIds={q.courseIds}
          />
        );
      })()}
    </div>
  );
}

function QuarterCell({
  quarter,
  courses: allCourses,
  completedCourseIds,
  onToggleCompletedCourse,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  onRemoveQuarter,
  onOpenAddCourse,
  onCourseClick,
  hoveredCourseId,
  relatedCourseIds,
  onHoverCourse,
}: {
  quarter: Quarter;
  courses: typeof courses;
  completedCourseIds: Set<string>;
  onToggleCompletedCourse: (courseId: string) => void;
  onAddCourse: (courseId: string) => void;
  onRemoveCourse: (courseId: string) => void;
  onMoveCourse: (sourceQuarterId: string, courseId: string, destQuarterId: string) => void;
  onRemoveQuarter?: (quarterId: string) => void;
  onOpenAddCourse: () => void;
  onCourseClick: (course: Course) => void;
  hoveredCourseId: string | null;
  relatedCourseIds: Set<string>;
  onHoverCourse: (id: string | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const addedIds = new Set(quarter.courseIds);
  const units = quarter.courseIds.reduce((sum, id) => {
    const c = allCourses.find((x) => x.id === id);
    return sum + (c?.units ?? 0);
  }, 0);
  const courseCount = quarter.courseIds.length;
  const shortLabel = getQuarterShortLabel(quarter.season, quarter.year);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const data = e.dataTransfer.getData("text/plain");
    const [sourceQuarterId] = data.split("|");
    if (sourceQuarterId && sourceQuarterId !== quarter.id) setIsDropTarget(true);
  };

  const handleDragLeave = () => setIsDropTarget(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    const data = e.dataTransfer.getData("text/plain");
    const [sourceQuarterId, courseId] = data.split("|");
    if (sourceQuarterId && courseId && sourceQuarterId !== quarter.id)
      onMoveCourse(sourceQuarterId, courseId, quarter.id);
  };

  return (
    <div
      className={`flex w-full flex-col rounded-lg border-2 bg-white shadow-sm transition-colors dark:bg-gray-800 ${
        isDropTarget ? "border-ucd-gold bg-ucd-gold/5 dark:bg-ucd-gold/10" : "border-gray-200 dark:border-gray-600"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="shrink-0 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{shortLabel}</span>
              <span className="text-sm tabular-nums text-gray-500">{units} units</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {courseCount} {courseCount === 1 ? "course" : "courses"} · {units} units
            </div>
          </div>
          {onRemoveQuarter && (
            <button
              type="button"
              onClick={() => onRemoveQuarter(quarter.id)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label={`Remove quarter ${shortLabel}`}
              title="Remove this quarter"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col items-start gap-1.5 overflow-y-auto p-3 w-full" style={{ maxHeight: "320px" }}>
        {quarter.courseIds.map((cid) => {
          const c = allCourses.find((x) => x.id === cid);
          if (!c) return null;
          const isCompleted = completedCourseIds.has(cid);
          const isRelated = relatedCourseIds.has(cid);
          const isHovered = hoveredCourseId === cid;
          const { prereqs, successors } = getRelatedCourseIds(cid);
          const hoveredCourse = hoveredCourseId ? allCourses.find((x) => x.id === hoveredCourseId) : null;
          const thisIsPrereqOfHovered = hoveredCourse?.prerequisites?.includes(cid);
          const hoveredIsSuccessorOfThis = hoveredCourseId && successors.includes(hoveredCourseId);
          const prereqCodes = prereqs
            .map((id) => allCourses.find((x) => x.id === id)?.code)
            .filter(Boolean);
          const successorCodes = successors
            .map((id) => allCourses.find((x) => x.id === id)?.code)
            .filter(Boolean);
          const bgClass = isCompleted
            ? "bg-emerald-200/90 border-emerald-400 text-gray-800 hover:bg-emerald-300/90"
            : isHovered
              ? "bg-ucd-gold/20 ring-2 ring-ucd-gold"
              : isRelated
                ? thisIsPrereqOfHovered
                  ? "bg-amber-50 ring-1 ring-amber-400/60"
                  : hoveredIsSuccessorOfThis
                    ? "bg-ucd-gold/15 ring-1 ring-ucd-gold/60"
                    : "bg-ucd-gold/10 ring-1 ring-ucd-gold/40"
                : "bg-emerald-50/90 text-gray-800 hover:bg-emerald-100/90";
          return (
            <li
              key={cid}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", `${quarter.id}|${cid}`);
                e.dataTransfer.effectAllowed = "move";
              }}
              className={`group w-full max-w-[260px] shrink-0 cursor-grab rounded-lg border border-gray-200 p-2 transition-all active:cursor-grabbing ${bgClass}`}
              onMouseEnter={() => onHoverCourse(cid)}
              onMouseLeave={(e) => {
                const li = e.currentTarget;
                const related = e.relatedTarget as Node | null;
                if (related && li.contains(related)) return;
                onHoverCourse(null);
              }}
              onClick={() => onCourseClick(c)}
              title={
                prereqCodes.length || successorCodes.length
                  ? `Prereqs: ${prereqCodes.join(", ") || "—"}. Leads to: ${successorCodes.join(", ") || "—"}. Click for details. Drag to trash to remove.`
                  : "Click for details. Drag to trash to remove."
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompletedCourse(cid);
                    }}
                    className="mt-0.5 shrink-0 rounded border border-gray-300 bg-white p-0.5 focus:outline-none focus:ring-2 focus:ring-ucd-gold"
                    aria-label={isCompleted ? `Mark ${c.code} incomplete` : `Mark ${c.code} complete`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="block h-4 w-4 rounded-sm border border-gray-400" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs font-semibold text-ucd-aggie">
                      {c.code}
                    </div>
                    <div className="mt-0.5 break-words text-sm leading-snug text-gray-700">
                      {c.name}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-xs text-gray-500">{c.units}u</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCourse(cid);
                    }}
                    className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${c.code}`}
                  >
                    <span className="sr-only">Remove</span>×
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {quarter.courseIds.length === 0 && (
        <div className="px-3 pb-2 text-center text-xs text-gray-400">
          Drop courses here or add below
        </div>
      )}
      <div className="shrink-0 border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={onOpenAddCourse}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:border-ucd-gold hover:bg-ucd-aggie/5 hover:text-ucd-aggie"
        >
          Add Course
        </button>
      </div>
    </div>
  );
}

