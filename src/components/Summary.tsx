import type { Major } from "../types";
import {
  getRequiredCourseIds,
  getRemainingCourseIds,
  getRemainingUnits,
  estimateQuartersRemaining,
  getQuarterLabel,
  getCurrentQuarter,
  addQuartersTo,
} from "../utils/planUtils";

interface SummaryProps {
  targetMajor: Major | null;
  completedIds: string[];
}

export function Summary({
  targetMajor,
  completedIds,
}: SummaryProps) {
  if (!targetMajor) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-ucd-aggie">Time to switch majors</h3>
        <p className="mt-2 text-gray-500">Select a target major to see an estimate.</p>
      </div>
    );
  }

  const requiredIds = getRequiredCourseIds(targetMajor);
  if (requiredIds.length === 0) {
    return (
      <div className="rounded-xl border-2 border-ucd-gold/30 bg-gradient-to-br from-ucd-aggie/5 to-ucd-gold/10 p-6 shadow-sm">
        <h3 className="font-semibold text-ucd-aggie">Time to complete {targetMajor.name}</h3>
        <p className="mt-2 text-sm text-gray-600">
          Course requirements for this major are in the{" "}
          <a href="https://catalog.ucdavis.edu/departments-programs-degrees/" target="_blank" rel="noopener noreferrer" className="text-ucd-gold underline">
            General Catalog
          </a>
          . Confirm with your advisor for an accurate timeline.
        </p>
      </div>
    );
  }

  const remainingIds = getRemainingCourseIds(targetMajor, completedIds);
  const remainingUnits = getRemainingUnits(targetMajor, completedIds);
  const quartersEst = estimateQuartersRemaining(targetMajor, completedIds, 14);
  const fromNow = getCurrentQuarter();
  const completionQ = addQuartersTo(fromNow, quartersEst);
  const estimatedGraduation = getQuarterLabel(completionQ.season, completionQ.year);

  return (
    <div className="rounded-xl border-2 border-ucd-gold/30 bg-gradient-to-br from-ucd-aggie/5 to-ucd-gold/10 p-6 shadow-sm">
      <h3 className="font-semibold text-ucd-aggie">Time to complete {targetMajor.name}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-2xl font-bold text-ucd-aggie">{remainingIds.length}</div>
          <div className="text-sm text-gray-600">Courses left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-ucd-aggie">{remainingUnits}</div>
          <div className="text-sm text-gray-600">Units left</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-ucd-aggie">~{quartersEst}</div>
          <div className="text-sm text-gray-600">Quarters from now (~14 units/qtr)</div>
        </div>
        <div>
          <div className="text-xl font-bold text-ucd-aggie">{estimatedGraduation}</div>
          <div className="text-sm text-gray-600">Estimated completion</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        This is an estimate. Confirm with your college advisor and the{" "}
        <a
          href="https://oasis.ucdavis.edu/forms/instructions/changeofmajor.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ucd-gold underline hover:no-underline"
        >
          Change of Major
        </a>{" "}
        process at UC Davis.
      </p>
    </div>
  );
}
