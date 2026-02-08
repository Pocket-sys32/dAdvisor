import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, type TabId } from "./components/Tabs";
import { ScheduleBuilder } from "./components/ScheduleBuilder";
import { MajorSelector } from "./components/MajorSelector";
import { ProgressBar } from "./components/ProgressBar";
import { RequirementsView } from "./components/RequirementsView";
import { QuarterPlanner } from "./components/QuarterPlanner";
import { Summary } from "./components/Summary";
import { Login } from "./components/Login";
import type { Quarter } from "./types";
import { majors } from "./data";
import { createEmptyQuarters, getCurrentAndNextQuarters } from "./utils/planUtils";

const DEFAULT_START = "Fall 2025";
const THEME_KEY = "dadvisor-theme";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const s = localStorage.getItem(THEME_KEY);
      if (s === "dark" || s === "light") return s;
    } catch {
      /* ignore */
    }
    return "light";
  });
  const [activeTab, setActiveTab] = useState<TabId>("schedule");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Shared: current major (used in Schedule Builder OASIS mock + Transfer)
  const [currentMajorId, setCurrentMajorId] = useState<string | null>(null);
  const currentMajor = useMemo(
    () => majors.find((m) => m.id === currentMajorId) ?? null,
    [currentMajorId]
  );
  const oasisLastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  // Schedule tab: completed courses (checkmarks on schedule builder)
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);

  // Schedule tab: quarters and start year (keep when switching tabs)
  const [scheduleQuarters, setScheduleQuarters] = useState<Quarter[]>(() =>
    getCurrentAndNextQuarters().map((q) => ({ ...q, courseIds: [] }))
  );
  const [scheduleStartYear, setScheduleStartYear] = useState(() => new Date().getFullYear());
  const handleScheduleQuartersChange = useCallback(
    (value: Quarter[] | ((prev: Quarter[]) => Quarter[])) => {
      setScheduleQuarters((prev) => (typeof value === "function" ? value(prev) : value));
    },
    []
  );

  // Transfer planner state
  const [targetMajorId, setTargetMajorId] = useState<string | null>(null);
  const [startQuarter, setStartQuarter] = useState(DEFAULT_START);
  const [quarters, setQuarters] = useState<Quarter[]>(() =>
    createEmptyQuarters(DEFAULT_START, 8).map((q) => ({ ...q, courseIds: [] }))
  );
  const targetMajor = useMemo(
    () => majors.find((m) => m.id === targetMajorId) ?? null,
    [targetMajorId]
  );

  // Transfer tab: completed courses per target major (so switching majors keeps each major's checkboxes)
  const [completedByMajor, setCompletedByMajor] = useState<Record<string, string[]>>({});
  const transferCompletedIds = targetMajorId ? (completedByMajor[targetMajorId] ?? []) : [];
  // Merge Schedule tab completions with Transfer tab so progress bar reflects both (e.g. checked on schedule builder)
  const transferDisplayCompletedIds = useMemo(
    () => [...new Set([...completedCourseIds, ...transferCompletedIds])],
    [completedCourseIds, transferCompletedIds]
  );
  const setTransferCompletedIds = useCallback((idsOrUpdater: string[] | ((prev: string[]) => string[])) => {
    if (!targetMajorId) return;
    const mid = targetMajorId;
    setCompletedByMajor((prev) => {
      const current = prev[mid] ?? [];
      const next = typeof idsOrUpdater === "function" ? idsOrUpdater(current) : idsOrUpdater;
      return { ...prev, [mid]: next };
    });
  }, [targetMajorId]);

  // Transfer tab: CE (and similar) additional requirement checkboxes per major
  const [additionalCheckedByMajor, setAdditionalCheckedByMajor] = useState<Record<string, string[]>>({});
  const transferCheckedReqIds = targetMajorId ? (additionalCheckedByMajor[targetMajorId] ?? []) : [];
  const toggleTransferRequirement = (requirementId: string) => {
    if (!targetMajorId) return;
    setAdditionalCheckedByMajor((prev) => {
      const current = prev[targetMajorId] ?? [];
      const next = current.includes(requirementId)
        ? current.filter((id) => id !== requirementId)
        : [...current, requirementId];
      return { ...prev, [targetMajorId]: next };
    });
  };

  const updateStartQuarter = (label: string) => {
    setStartQuarter(label);
    const empty = createEmptyQuarters(label, 8).map((q) => ({ ...q, courseIds: [] as string[] }));
    setQuarters(empty);
  };

  const quarterOptions = useMemo(() => {
    const y = new Date().getFullYear();
    const out: string[] = [];
    for (let year = y - 1; year <= y + 3; year++) {
      out.push(`Fall ${year}`, `Winter ${year}`, `Spring ${year}`, `Summer ${year}`);
    }
    return out;
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen font-sans antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ucd-aggie dark:text-ucd-gold sm:text-2xl">
                <span className="text-ucd-gold">d</span>Advisor
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Plan your UC Davis undergrad — 4-year schedule & major transfer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                aria-label={theme === "light" ? "Dark mode" : "Light mode"}
              >
                {theme === "light" ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <Tabs active={activeTab} onSelect={setActiveTab} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === "schedule" && (
          <ScheduleBuilder
            currentMajorId={currentMajorId}
            currentMajor={currentMajor}
            currentMajorName={currentMajor?.name ?? null}
            onCurrentMajorChange={setCurrentMajorId}
            oasisLastUpdated={oasisLastUpdated}
            majors={majors.map((m) => ({ id: m.id, name: m.name, degree: m.degree }))}
            completedCourseIds={completedCourseIds}
            onCompletedCourseIdsChange={setCompletedCourseIds}
            quarters={scheduleQuarters}
            onQuartersChange={handleScheduleQuartersChange}
            startYear={scheduleStartYear}
            onStartYearChange={setScheduleStartYear}
          />
        )}

        {activeTab === "transfer" && (
          <div className="space-y-10">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
                1. Choose your majors
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <MajorSelector
                  label="Current major"
                  value={currentMajorId}
                  onChange={setCurrentMajorId}
                />
                <MajorSelector
                  label="Target major (to switch into)"
                  value={targetMajorId}
                  onChange={setTargetMajorId}
                  excludeId={currentMajorId}
                />
              </div>
            </section>

            {targetMajor && (
              <>
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
                    2. Requirements for {targetMajor.name}
                  </h2>
                  <div className="mb-6">
                    <ProgressBar major={targetMajor} completedIds={transferDisplayCompletedIds} />
                  </div>
                  <RequirementsView
                    major={targetMajor}
                    completedIds={transferDisplayCompletedIds}
                    checkedRequirementIds={transferCheckedReqIds}
                    onToggleRequirement={toggleTransferRequirement}
                    onToggleCourse={(courseId) =>
                      setTransferCompletedIds((prev) =>
                        prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
                      )
                    }
                  />
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
                      3. Plan your quarters
                    </h2>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Start quarter:</label>
                      <select
                        value={startQuarter}
                        onChange={(e) => updateStartQuarter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30"
                      >
                        {quarterOptions.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <QuarterPlanner
                    targetMajor={targetMajor}
                    completedIds={transferDisplayCompletedIds}
                    quarters={quarters}
                    onQuartersChange={setQuarters}
                  />
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
                    4. Summary
                  </h2>
                  <Summary
                    targetMajor={targetMajor}
                    completedIds={transferDisplayCompletedIds}
                  />
                </section>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-gray-50/80 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
        Not affiliated with UC Davis. Confirm with your advisor and the{" "}
        <a
          href="https://registrar.ucdavis.edu/records/changes-major-minor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ucd-gold underline hover:no-underline"
        >
          Registrar
        </a>
        .
      </footer>
    </div>
  );
}

export default App;
