import { useState } from "react";

export default function Notes({ state, update }) {
    const [noteText, setNoteText] = useState("");
    const [reminderForm, setReminderForm] = useState({ text: "", time: "" });
    const [tab, setTab] = useState("notes");

    const notes = state.notes || [];
    const reminders = state.reminders || [];

    function addNote() {
        if (!noteText.trim()) return;
        update((s) => {
            s.notes.unshift({
                id: Date.now().toString(),
                text: noteText.trim(),
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            });
        });
        setNoteText("");
    }

    function deleteNote(id) {
        update((s) => { s.notes = s.notes.filter((n) => n.id !== id); });
    }

    function addReminder() {
        if (!reminderForm.text.trim() || !reminderForm.time) return;
        update((s) => {
            s.reminders.push({
                id: Date.now().toString(),
                text: reminderForm.text.trim(),
                time: reminderForm.time,
                active: true,
            });
            s.reminders.sort((a, b) => a.time.localeCompare(b.time));
        });
        setReminderForm({ text: "", time: "" });
    }

    function toggleReminder(id) {
        update((s) => {
            const r = s.reminders.find((r) => r.id === id);
            if (r) r.active = !r.active;
        });
    }

    function deleteReminder(id) {
        update((s) => { s.reminders = s.reminders.filter((r) => r.id !== id); });
    }

    return (
        <div>
            <div className="page-title">Notes & Reminders</div>

            <div className="tab-bar">
                {["notes", "reminders"].map(t => (
                    <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === "notes" && (
                <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
                        <input
                            type="text"
                            placeholder="Kuch note karo..."
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addNote()}
                            style={{ flex: 1 }}
                        />
                        <button className="btn primary sm" onClick={addNote}>Add</button>
                    </div>
                    {notes.length === 0 ? (
                        <div style={{ color: "var(--muted)", fontSize: 14 }}>Koi note nahi.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {notes.map(n => (
                                <div key={n.id} className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, marginBottom: 4 }}>{n.text}</div>
                                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{n.date} {n.time}</div>
                                    </div>
                                    <button onClick={() => deleteNote(n.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === "reminders" && (
                <div>
                    <div className="card" style={{ marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <input type="text" placeholder="Reminder text..." value={reminderForm.text} onChange={e => setReminderForm(f => ({ ...f, text: e.target.value }))} />
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    type="time"
                                    value={reminderForm.time}
                                    onChange={e => setReminderForm(f => ({ ...f, time: e.target.value }))}
                                    style={{ flex: 1, background: "var(--surface2)", border: "0.5px solid var(--border2)", color: "var(--text)", padding: "9px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none" }}
                                />
                                <button className="btn primary sm" onClick={addReminder}>Add</button>
                            </div>
                        </div>
                    </div>
                    {reminders.length === 0 ? (
                        <div style={{ color: "var(--muted)", fontSize: 14 }}>Koi reminder nahi.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {reminders.map(r => (
                                <div key={r.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, opacity: r.active ? 1 : 0.5 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--green)", flexShrink: 0 }}>{r.time}</div>
                                    <div style={{ flex: 1, fontSize: 14 }}>{r.text}</div>
                                    <button className={`btn sm${r.active ? "" : " primary"}`} onClick={() => toggleReminder(r.id)}>
                                        {r.active ? "On" : "Off"}
                                    </button>
                                    <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}