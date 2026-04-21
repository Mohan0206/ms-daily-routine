import { useState } from "react";
import { dayDiff, dayPct, getWeekDates, getMonthDates, formatDate } from "../utils/dates";

export default function Analytics({ state, TASKS }) {
    const { start, completions } = state;
    const [view, setView] = useState("daily");
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);

    if (!start) {
        return (
            <div className="start-screen">
                <div className="start-box">
                    <div className="start-title">Challenge shuru karo pehle</div>
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const elapsed = dayDiff(start, today);

    function DailyView() {
        const days = Array.from({ length: Math.min(elapsed + 1, 90) }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dk = d.toISOString().slice(0, 10);
            return { dk, dayNum: i + 1, pct: dayPct(completions, dk, TASKS) };
        }).reverse();

        return (
            <div>
                <div className="section-label">Task-wise completion (overall)</div>
                <div className="card" style={{ marginBottom: "1.25rem" }}>
                    {TASKS.map((t) => {
                        const totalDays = Math.min(elapsed + 1, 90);
                        let done = 0;
                        for (let i = 0; i < totalDays; i++) {
                            const d = new Date(start);
                            d.setDate(d.getDate() + i);
                            const dk = d.toISOString().slice(0, 10);
                            if (completions[dk]?.[t.id]) done++;
                        }
                        const pct = totalDays > 0 ? Math.round((done / totalDays) * 100) : 0;
                        const isWeak = pct < 60;
                        return (
                            <div key={t.id} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                                    <span style={{ color: isWeak ? "var(--red)" : "var(--text)" }}>
                                        {t.name} {isWeak ? "⚠" : ""}
                                    </span>
                                    <span style={{ color: "var(--muted)" }}>{done}/{totalDays} ({pct}%)</span>
                                </div>
                                <div className="prog-track">
                                    <div className="prog-fill" style={{ width: pct + "%", background: pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="section-label">Daily log</div>
                <div className="card">
                    {days.map((d) => (
                        <div key={d.dk}>
                            <div
                                onClick={() => setSelectedDay(selectedDay === d.dk ? null : d.dk)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid var(--border)", cursor: "pointer" }}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>Day {d.dayNum} — {formatDate(d.dk)}</div>
                                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                                        {Object.keys(completions[d.dk] || {}).length}/{TASKS.length} tasks
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ fontSize: 16, fontWeight: 500, color: d.pct >= 80 ? "var(--green)" : d.pct >= 50 ? "var(--amber)" : "var(--red)" }}>
                                        {d.pct}%
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{selectedDay === d.dk ? "▲" : "▼"}</div>
                                </div>
                            </div>

                            {selectedDay === d.dk && (
                                <div style={{ padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
                                    <div style={{ marginBottom: 8, fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>COMPLETED</div>
                                    {TASKS.filter(t => completions[d.dk]?.[t.id]).map(t => (
                                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
                                            <span style={{ fontSize: 13, flex: 1 }}>{t.name}</span>
                                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{completions[d.dk][t.id].time}</span>
                                        </div>
                                    ))}
                                    {TASKS.filter(t => !completions[d.dk]?.[t.id]).length > 0 && (
                                        <>
                                            <div style={{ marginBottom: 8, marginTop: 10, fontSize: 11, color: "var(--red)", fontWeight: 500 }}>MISSED</div>
                                            {TASKS.filter(t => !completions[d.dk]?.[t.id]).map(t => (
                                                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />
                                                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{t.name}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function WeeklyView() {
        const dates = getWeekDates(weekOffset);
        const validDates = dates.filter(dk => dayDiff(start, dk) >= 0 && dayDiff(start, dk) <= elapsed);
        const weekPct = validDates.length > 0
            ? Math.round(validDates.reduce((a, dk) => a + dayPct(completions, dk, TASKS), 0) / validDates.length) : 0;

        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                    <button className="btn sm" onClick={() => setWeekOffset(w => w - 1)}>← Prev</button>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                        {formatDate(dates[0])} — {formatDate(dates[6])}
                    </div>
                    <button className="btn sm" onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} disabled={weekOffset >= 0}>Next →</button>
                </div>

                <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
                    <div className="stat-card"><div className="stat-val green">{weekPct}%</div><div className="stat-lbl">Week avg</div></div>
                    <div className="stat-card"><div className="stat-val">{validDates.filter(dk => dayPct(completions, dk, TASKS) >= 80).length}</div><div className="stat-lbl">Strong days</div></div>
                    <div className="stat-card"><div className="stat-val">{validDates.reduce((a, dk) => a + Object.keys(completions[dk] || {}).length, 0)}</div><div className="stat-lbl">Tasks done</div></div>
                    <div className="stat-card"><div className="stat-val">{validDates.reduce((a, dk) => a + (TASKS.length - Object.keys(completions[dk] || {}).length), 0)}</div><div className="stat-lbl">Tasks missed</div></div>
                </div>

                <div className="section-label">Daily breakdown</div>
                <div className="card" style={{ marginBottom: "1.25rem" }}>
                    {dates.map(dk => {
                        const isFuture = dayDiff(start, dk) > elapsed || dayDiff(start, dk) < 0;
                        const pct = isFuture ? 0 : dayPct(completions, dk, TASKS);
                        const dayName = new Date(dk).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
                        return (
                            <div key={dk} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                                    <span style={{ color: isFuture ? "var(--hint)" : "var(--text)" }}>{dayName}</span>
                                    <span style={{ color: "var(--muted)" }}>{isFuture ? "—" : pct + "%"}</span>
                                </div>
                                <div className="prog-track">
                                    <div className="prog-fill" style={{ width: pct + "%", background: pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="section-label">Task breakdown this week</div>
                <div className="card">
                    {TASKS.map(t => {
                        const done = validDates.filter(dk => completions[dk]?.[t.id]).length;
                        const pct = validDates.length > 0 ? Math.round((done / validDates.length) * 100) : 0;
                        return (
                            <div key={t.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: pct < 60 ? "var(--red)" : "var(--text)" }}>{t.name}</span>
                                    <span style={{ color: "var(--muted)" }}>{done}/{validDates.length} ({pct}%)</span>
                                </div>
                                <div className="prog-track">
                                    <div className="prog-fill" style={{ width: pct + "%", background: pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    function MonthlyView() {
        const dates = getMonthDates(monthOffset);
        const validDates = dates.filter(dk => dayDiff(start, dk) >= 0 && dayDiff(start, dk) <= elapsed);
        const monthName = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1)
            .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        const monthPct = validDates.length > 0
            ? Math.round(validDates.reduce((a, dk) => a + dayPct(completions, dk, TASKS), 0) / validDates.length) : 0;

        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                    <button className="btn sm" onClick={() => setMonthOffset(m => m - 1)}>← Prev</button>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 500 }}>{monthName}</div>
                    <button className="btn sm" onClick={() => setMonthOffset(m => Math.min(m + 1, 0))} disabled={monthOffset >= 0}>Next →</button>
                </div>

                <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
                    <div className="stat-card"><div className="stat-val green">{monthPct}%</div><div className="stat-lbl">Month avg</div></div>
                    <div className="stat-card"><div className="stat-val">{validDates.filter(dk => dayPct(completions, dk, TASKS) >= 80).length}</div><div className="stat-lbl">Strong days</div></div>
                    <div className="stat-card"><div className="stat-val">{validDates.reduce((a, dk) => a + Object.keys(completions[dk] || {}).length, 0)}</div><div className="stat-lbl">Tasks done</div></div>
                    <div className="stat-card"><div className="stat-val">{dates.length}</div><div className="stat-lbl">Total days</div></div>
                </div>

                <div className="section-label">Weak areas (60% se kam)</div>
                <div className="card" style={{ marginBottom: "1.25rem" }}>
                    {(() => {
                        const weak = TASKS.filter(t => {
                            const done = validDates.filter(dk => completions[dk]?.[t.id]).length;
                            return validDates.length > 0 && (done / validDates.length) * 100 < 60;
                        });
                        return weak.length === 0 ? (
                            <div style={{ color: "var(--green)", fontSize: 14, padding: "8px 0" }}>Koi weak area nahi — excellent!</div>
                        ) : weak.map(t => {
                            const done = validDates.filter(dk => completions[dk]?.[t.id]).length;
                            const pct = Math.round((done / validDates.length) * 100);
                            return (
                                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--border)" }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                                    <span style={{ flex: 1, color: "var(--red)" }}>{t.name}</span>
                                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{pct}%</span>
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className="section-label">Task breakdown</div>
                <div className="card">
                    {TASKS.map(t => {
                        const done = validDates.filter(dk => completions[dk]?.[t.id]).length;
                        const pct = validDates.length > 0 ? Math.round((done / validDates.length) * 100) : 0;
                        return (
                            <div key={t.id} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: pct < 60 ? "var(--red)" : "var(--text)" }}>{t.name}</span>
                                    <span style={{ color: "var(--muted)" }}>{done}/{validDates.length} ({pct}%)</span>
                                </div>
                                <div className="prog-track">
                                    <div className="prog-fill" style={{ width: pct + "%", background: pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-title">Analytics</div>
            <div className="tab-bar">
                {["daily", "weekly", "monthly"].map(v => (
                    <button key={v} className={`tab-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>
            {view === "daily" && <DailyView />}
            {view === "weekly" && <WeeklyView />}
            {view === "monthly" && <MonthlyView />}
        </div>
    );
}