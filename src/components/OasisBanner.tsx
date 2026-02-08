/** Mock "Data from OASIS" banner — looks like info pulled from the student portal. */
export function OasisBanner({
  currentMajorName,
  lastUpdated,
}: {
  currentMajorName: string | null;
  lastUpdated: string;
}) {
  return (
    <div className="rounded-xl border-2 border-ucd-aggie/20 bg-gradient-to-r from-ucd-aggie/10 to-ucd-gold/10 px-4 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ucd-aggie text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ucd-aggie/80">
              Data from OASIS
            </div>
            <div className="text-sm text-gray-700">
              Student ID: 9******* • {currentMajorName ? `Major: ${currentMajorName}` : "Major: —"} • Units: 45
            </div>
            <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-500"
          >
            Refresh from OASIS
          </button>
          <span className="text-xs text-gray-400">(mock — not connected)</span>
        </div>
      </div>
    </div>
  );
}
