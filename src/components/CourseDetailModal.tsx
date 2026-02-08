import type { Course } from "../types";
import { courses } from "../data/courses";

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
}

export function CourseDetailModal({ course, onClose }: CourseDetailModalProps) {
  if (!course) return null;

  const prereqCourses = (course.prerequisites ?? [])
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean) as Course[];
  const offered = course.typicallyOffered?.length
    ? course.typicallyOffered.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")
    : "See catalog";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-detail-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 bg-ucd-aggie px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 id="course-detail-title" className="text-lg font-bold text-white">
              {course.code}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-white/90 hover:bg-white/20"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="mt-0.5 text-sm text-white/90">{course.name}</p>
          <p className="text-xs text-white/80">{course.units} units</p>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {course.description && (
            <p className="mb-4 text-sm text-gray-700">{course.description}</p>
          )}
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-ucd-aggie">Typically offered: </span>
              <span className="text-gray-600">{offered}</span>
            </div>
            {prereqCourses.length > 0 && (
              <div>
                <span className="font-semibold text-ucd-aggie">Prerequisites: </span>
                <span className="text-gray-600">
                  {prereqCourses.map((c) => c.code).join(", ")}
                </span>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            See the{" "}
            <a
              href="https://catalog.ucdavis.edu/course-search/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ucd-gold underline"
            >
              UC Davis Course Catalog
            </a>{" "}
            for full details.
          </p>
        </div>
      </div>
    </div>
  );
}
