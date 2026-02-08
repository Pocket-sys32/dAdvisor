import { getCurrentQuarter, getQuarterShortLabel } from "../utils/planUtils";

/** Mock dates for current quarter (typical UC Davis style). */
function getMockDeadlines(season: string, year: number) {
  const y = year;
  const shortLabel = getQuarterShortLabel(
    season as "fall" | "winter" | "spring" | "summer",
    year
  );
  switch (season) {
    case "fall":
      return {
        quarter: shortLabel,
        instructionStart: `Sept ${y}`,
        addDropDeadline: `Oct 1, ${y}`,
        lastDayInstruction: `Dec 6, ${y}`,
        finals: `Dec 9–13, ${y}`,
      };
    case "winter":
      return {
        quarter: shortLabel,
        instructionStart: `Jan ${y + 1}`,
        addDropDeadline: `Jan 15, ${y + 1}`,
        lastDayInstruction: `Mar 14, ${y + 1}`,
        finals: `Mar 17–21, ${y + 1}`,
      };
    case "spring":
      return {
        quarter: shortLabel,
        instructionStart: `Mar ${y}`,
        addDropDeadline: `Apr 1, ${y}`,
        lastDayInstruction: `Jun 6, ${y}`,
        finals: `Jun 9–13, ${y}`,
      };
    case "summer":
      return {
        quarter: shortLabel,
        instructionStart: `Jun ${y}`,
        addDropDeadline: `Session 1: Jun 15; Session 2: Jul 15, ${y}`,
        lastDayInstruction: `Aug ${y}`,
        finals: `Per session, ${y}`,
      };
    default:
      return {
        quarter: shortLabel,
        instructionStart: "—",
        addDropDeadline: "—",
        lastDayInstruction: "—",
        finals: "—",
      };
  }
}

export function CurrentQuarterDeadlines() {
  const cur = getCurrentQuarter();
  const d = getMockDeadlines(cur.season, cur.year);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
        Current quarter — {d.quarter}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Key dates (mock; confirm at{" "}
        <a
          href="https://registrar.ucdavis.edu/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ucd-gold underline hover:no-underline dark:text-ucd-gold"
        >
          Registrar
        </a>
        )
      </p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-gray-700 dark:text-gray-300">Instruction begins</dt>
          <dd className="text-gray-600 dark:text-gray-400">{d.instructionStart}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700 dark:text-gray-300">Add/Drop deadline</dt>
          <dd className="text-gray-600 dark:text-gray-400">{d.addDropDeadline}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700 dark:text-gray-300">Last day of instruction</dt>
          <dd className="text-gray-600 dark:text-gray-400">{d.lastDayInstruction}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700 dark:text-gray-300">Finals</dt>
          <dd className="text-gray-600 dark:text-gray-400">{d.finals}</dd>
        </div>
      </dl>
    </section>
  );
}
