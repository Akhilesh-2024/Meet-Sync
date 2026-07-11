import { Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { ScheduleNew } from "./pages/ScheduleNew";
import { CalendarView } from "./pages/CalendarView";
import { AuthLayout } from "./layouts/AuthLayout";
import { SidebarLayout } from "./layouts/SidebarLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<Auth />} />
      </Route>

      <Route element={<SidebarLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule/new" element={<ScheduleNew />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Route>
    </Routes>
  );
}
