import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold text-brand-700">MeetSync</div>
        <Link to="/auth">
          <Button>Get Started</Button>
        </Link>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Schedule across time zones, <span className="text-brand-600">instantly</span>.
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          MeetSync analyzes everyone's calendars and finds the earliest slot that actually works — no more back-and-forth emails.
        </p>
        <div className="mt-10">
          <Link to="/auth">
            <Button className="px-8 py-3 text-base">Get Started free</Button>
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          { title: "Visual", desc: "See free/busy time at a glance, converted to your local timezone." },
          { title: "Fast", desc: "Suggestions generated in under 200ms from merged calendar data." },
          { title: "Sync", desc: "One click books the meeting and notifies every attendee." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-brand-700">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
