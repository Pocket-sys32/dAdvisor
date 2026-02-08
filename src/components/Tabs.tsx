export type TabId = "schedule" | "transfer";

interface TabsProps {
  active: TabId;
  onSelect: (id: TabId) => void;
}

const TABS: { id: TabId; label: string; description: string }[] = [
  { id: "schedule", label: "Schedule Builder", description: "Plan your 4 years" },
  { id: "transfer", label: "Major Transfer", description: "Switch majors" },
];

export function Tabs({ active, onSelect }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-gray-100 p-1" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex-1 rounded-lg px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ucd-gold focus:ring-offset-2 ${
            active === tab.id
              ? "bg-white font-semibold text-ucd-aggie shadow-sm"
              : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
          }`}
        >
          <span className="block text-sm">{tab.label}</span>
          <span className={`block text-xs ${active === tab.id ? "text-ucd-aggie/70" : "text-gray-500"}`}>
            {tab.description}
          </span>
        </button>
      ))}
    </div>
  );
}
