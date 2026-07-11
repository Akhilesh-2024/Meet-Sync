import { KeyboardEvent, useState } from "react";

interface AttendeeInputProps {
  attendees: string[];
  onChange: (attendees: string[]) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AttendeeInput({ attendees, onChange }: AttendeeInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const email = draft.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (attendees.includes(email)) {
      setError("That attendee is already added");
      return;
    }
    onChange([...attendees, email]);
    setDraft("");
    setError(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Backspace" && draft === "" && attendees.length > 0) {
      onChange(attendees.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        {attendees.map((email) => (
          <span key={email} className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-700">
            {email}
            <button type="button" onClick={() => onChange(attendees.filter((a) => a !== email))} className="text-brand-500 hover:text-brand-800">
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder="attendee@company.com"
          className="min-w-[160px] flex-1 border-none text-sm outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
