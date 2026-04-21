import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import Analytics from "./components/Analytics";
import TodoList from "./components/TodoList";
import Reading from "./components/Reading";
import Notes from "./components/Notes";
import Settings from "./components/Settings";
import { loadState, saveState } from "./utils/storage";
import { TASKS } from "./utils/tasks";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
  { id: "todo", label: "Todo" },
  { id: "reading", label: "Reading" },
  { id: "notes", label: "Notes" },
  { id: "settings", label: "Settings" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [state, setState] = useState(() => loadState());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  function update(fn) {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function toggleTask(taskId) {
    update((s) => {
      const dk = today();
      if (!s.completions[dk]) s.completions[dk] = {};
      if (s.completions[dk][taskId]) {
        delete s.completions[dk][taskId];
      } else {
        s.completions[dk][taskId] = {
          done: true,
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
    });
  }

  const props = { state, update, today, toggleTask, TASKS };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-logo">MS <span>Daily</span></div>
        <div className="sidebar-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </div>
        <div className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-btn${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mobile-header">
        <div className="mob-logo">MS <span>Daily</span></div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`mob-nav-btn${tab === t.id ? " active" : ""}`}
              onClick={() => { setTab(t.id); setMenuOpen(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <main className="main">
        {tab === "dashboard" && <Dashboard {...props} />}
        {tab === "calendar" && <CalendarView {...props} />}
        {tab === "analytics" && <Analytics {...props} />}
        {tab === "todo" && <TodoList {...props} />}
        {tab === "reading" && <Reading {...props} />}
        {tab === "notes" && <Notes {...props} />}
        {tab === "settings" && <Settings {...props} />}
      </main>
    </div>
  );
}