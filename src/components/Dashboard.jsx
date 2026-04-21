import { dayDiff, dayPct, getStreak, getAvg } from "../utils/dates";

export default function Dashboard({ state, update, today, toggleTask, TASKS }) {
    const { start, completions } = state;

    function start90() {
        update((s) => { s.start = today(); s.completions = {}; });
    }

    function reset90() {
        if (!confirm("Sab data delete hoga. Sure?")) return;
        update((s) => { s.start = null; s.completions = {}; });
    }

    if (!start) {
        return (
            <div className="start-screen">
                <div className="start-box">
                    <div className="start-title">90 din.<br />Apne dam par.</div>
                    <div className="start-sub">
                        Aaj se shuru karo — har din track karo,<br />
                        streak banao, 90 din paar karo.
                    </div>
                    <button className="btn primary" onClick={start90}>Shuru Karo</button>
                </div>
            </div>
        );
    }

    const elapsed = dayDiff(start, today());
    const dayNum = Math.min(elapsed + 1, 90);
    const daysLeft = Math.max(0, 90 - elapsed);
    const pct = Math.round((elapsed / 90) * 100);
    const dk = today();
    const todayPct = dayPct(completions, dk, TASKS);
    const streak = getStreak(completions, start, TASKS);
    const avg = getAvg(completions, start, TASKS);
    const comp = completions[dk] || {};

    return (
        <div>
            <div className="page-title">Dashboard</div>

            <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
                <div className="stat-card">
                    <div className="stat-val green">{daysLeft}</div>
                    <div className="stat-lbl">Days remaining</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{todayPct}%</div>
                    <div className="stat-lbl">Aaj complete</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{streak}</div>
                    <div className="stat-lbl">Day streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{avg}%</div>
                    <div className="stat-lbl">Avg completion</div>
                </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                    <span>Day {dayNum} of 90</span>
                    <span>{pct}%</span>
                </div>
                <div className="prog-track">
                    <div className="prog-fill" style={{ width: pct + "%" }} />
                </div>
            </div>

            <div className="section-label">Aaj ki routine</div>
            <div className="tasks-card" style={{ marginBottom: "1.5rem" }}>
                {TASKS.map((t) => (
                    <div
                        key={t.id}
                        className={`task-row${comp[t.id] ? " done" : ""}`}
                        onClick={() => toggleTask(t.id)}
                    >
                        <div className={`cb${comp[t.id] ? " on" : ""}`} />
                        <div className="task-dot" style={{ background: t.color }} />
                        <span className="task-name">{t.name}</span>
                        <span className="task-time-stamp">
                            {comp[t.id] ? comp[t.id].time : t.time}
                        </span>
                    </div>
                ))}
            </div>

            <button className="btn danger sm" onClick={reset90}>Reset challenge</button>
        </div>
    );
}