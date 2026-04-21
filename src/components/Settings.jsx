import { useState } from "react";
import { TASKS as DEFAULT_TASKS } from "../utils/tasks";

export default function Settings({ state, update }) {
    const [newTask, setNewTask] = useState({ name: "", time: "", color: "#9B8CF5" });

    const customTasks = state.settings?.customTasks || [];
    const allTasks = [...DEFAULT_TASKS, ...customTasks];

    function addCustomTask() {
        if (!newTask.name.trim()) return;
        update((s) => {
            if (!s.settings.customTasks) s.settings.customTasks = [];
            s.settings.customTasks.push({
                id: "custom_" + Date.now(),
                name: newTask.name.trim(),
                time: newTask.time || "—",
                color: newTask.color,
            });
        });
        setNewTask({ name: "", time: "", color: "#9B8CF5" });
    }

    function removeCustomTask(id) {
        update((s) => {
            s.settings.customTasks = (s.settings.customTasks || []).filter((t) => t.id !== id);
        });
    }

    function exportData() {
        const data = JSON.stringify(state, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ms-routine-backup.json";
        a.click();
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (!confirm("Import karega toh current data replace ho jayega. Sure?")) return;
                update((s) => Object.assign(s, imported));
            } catch {
                alert("Invalid file.");
            }
        };
        reader.readAsText(file);
    }

    return (
        <div>
            <div className="page-title">Settings</div>

            <div className="section-label">Current tasks</div>
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                {allTasks.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14 }}>{t.name}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{t.time}</span>
                        {t.id.startsWith("custom_") && (
                            <button onClick={() => removeCustomTask(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="section-label">Naya task add karo</div>
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input type="text" placeholder="Task naam *" value={newTask.name} onChange={e => setNewTask(f => ({ ...f, name: e.target.value }))} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="text" placeholder="Time (e.g. 5:00 AM)" value={newTask.time} onChange={e => setNewTask(f => ({ ...f, time: e.target.value }))} style={{ flex: 1 }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <label style={{ fontSize: 12, color: "var(--muted)" }}>Color</label>
                            <input type="color" value={newTask.color} onChange={e => setNewTask(f => ({ ...f, color: e.target.value }))}
                                style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", borderRadius: 6 }} />
                        </div>
                    </div>
                    <button className="btn primary sm" onClick={addCustomTask}>Add Task</button>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                    Note: Custom tasks existing system ko affect nahi karenge.
                </div>
            </div>

            <div className="section-label">Data management</div>
            <div className="card">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button className="btn" onClick={exportData}>Export backup (.json)</button>
                    <label className="btn" style={{ cursor: "pointer", textAlign: "center" }}>
                        Import backup
                        <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
                    </label>
                    <button className="btn danger" onClick={() => {
                        if (confirm("Sab data permanently delete hoga. Sure?")) {
                            update((s) => { s.start = null; s.completions = {}; s.todos = []; s.books = []; s.notes = []; s.reminders = []; });
                        }
                    }}>
                        Sab data reset karo
                    </button>
                </div>
            </div>
        </div>
    );
}