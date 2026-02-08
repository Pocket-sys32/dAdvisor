export function CEAdditionalRequirements() {
  const fiveAdditional = [
    "Five additional letter-graded upper division EEC or ECS courses (except ECS 111, 113, 115, 116, 117, 132, 154A, 154B, 171, 188).",
    "Transfer students: one additional upper division EEC/ECS course required (6 total).",
  ];

  const seniorDesign = [
    "EEC 134A + 134B — RF/Microwave Systems Design",
    "EEC 136A + 136B — Electronic Design Project",
    "EEC 174AY + 174BY — Applied Machine Learning",
    "EEC 175A + 175B — Internet of Things",
    "EEC 181A + 181B — Digital Systems Design Project",
    "EEC 193A + 193B — Senior Design Project",
    "EEC 195A + 195B — Autonomous Vehicle Design Project",
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-ucd-aggie dark:text-ucd-gold">
        Computer Engineering — Additional requirements
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Reference for 5 additional upper div courses and senior design options.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            5 additional upper division EEC or ECS courses
          </h4>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
            {fiveAdditional.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Senior design project (choose one set)
          </h4>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Does not count as upper division elective. Both A and B required for credit.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {seniorDesign.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ucd-gold">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
