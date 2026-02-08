import { majors } from "../data";

interface MajorSelectorProps {
  label: string;
  value: string | null;
  onChange: (majorId: string | null) => void;
  excludeId?: string | null;
}

export function MajorSelector({ label, value, onChange, excludeId }: MajorSelectorProps) {
  const options = majors.filter((m) => m.id !== excludeId);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ucd-aggie">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30"
      >
        <option value="">Select a major…</option>
        {options.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.degree})
          </option>
        ))}
      </select>
    </div>
  );
}
