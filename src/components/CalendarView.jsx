import { useState } from "react";
import { dayDiff, dayPct, formatDate } from "../utils/dates";

export default function CalendarView({ state, TASKS }) {
    const { start, completions } = state;
    const [selected, setSelected] = useState(null);

    if (!start) {
        return (
            <div className="start-screen">
                <div className="start-box">
                    <div className="start-title">Challenge shuru karo pehle</div>
                    <div className="start-sub">Dashboard pe jaao aur "Shuru Karo" dabao.</div>
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const elapsed = dayDiff(start, today);

    function getCellColor(pct, isFuture) {
        if (isFuture) return "var(--hint)";
        if (pct >= 80) return "#2DD68A";
        if (pct >= 50) return "#97C459";
        if (pct > 0) return "#F2A600";
        return "#E25252";
    }

    const days = Array.from({ length: 90 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dk = d.toISOString().slice(0, 10);
        const past = dayDiff(start, dk) <= elapsed;
        const pct = past ? dayPct(completions, dk, TASKS) : null;
        return { dk, dayNum: i + 1, past, pct };
    });

    const sel = selected ? days.find((d) => d.dk === selected) : null;
    const selComp = selected ? completions[selected] || {} : {};

    return (
        <div>
            <div className="page-title">Calendar</div>

            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <div className="section-label" style={{ marginBottom: 12 }}>90-Day Overview</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
                    {days.map((d) => (
                        <div
                            key={d.dk}
                            title={`Day ${d.dayNum}: ${d.pct !== null ? d.pct + "%" : "future"}`}
                            onClick={() => d.past && setSelected(d.dk === selected ? null : d.dk)}
                            style={{
                                aspectRatio: 1, borderRadius: 4,
                                background: getCellColor(d.pct, !d.past),
                                cursor: d.past ? "pointer" : "default",
                                outline: d.dk === selected ? "2px solid var(--text)" : "none",
                                outlineOffset: 1,
                            }}
                        />
                    ))}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                    {[["#2DD68A", "80%+"], ["#97C459", "50%+"], ["#F2A600", "Kuch"], ["#E25252", "Zero"], ["var(--hint)", "Future"]].map(([c, l]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--muted)" }}>
                            <div style={{ width: 9, height: 9, borderRadius: 2, background: c }} />{l}
                        </div>
                    ))}
                </div>
            </div>

            {sel && (
                <div className="card">
                    <div className="section-label" style={{ marginBottom: 12 }}>
                        Day {sel.dayNum} — {formatDate(sel.dk)} — {sel.pct}% complete
                    </div>
                    <div className="tasks-card">
                        {TASKS.map((t) => {
                            const done = !!selComp[t.id];
                            return (
                                <div key={t.id} className={`task-row${done ? " done" : ""}`} style={{ cursor: "default" }}>
                                    <div className={`cb${done ? " on" : ""}`} style={{ pointerEvents: "none" }} />
                                    <div className="task-dot" style={{ background: t.color }} />
                                    <span className="task-name">{t.name}</span>
                                    <span className="task-time-stamp">{done ? selComp[t.id].time : "—"}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}