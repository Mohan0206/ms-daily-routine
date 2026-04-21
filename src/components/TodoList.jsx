import { useState } from "react";

export default function TodoList({ state, update, today, toggleTask, TASKS }) {
    const [newTask, setNewTask] = useState("");
    const dk = today();
    const comp = state.completions[dk] || {};

    function addTodo() {
        const text = newTask.trim();
        if (!text) return;
        update((s) => {
            s.todos.push({ id: Date.now().toString(), text, done: false, date: dk });
        });
        setNewTask("");
    }

    function toggleTodo(id) {
        update((s) => {
            const t = s.todos.find((t) => t.id === id);
            if (t) t.done = !t.done;
        });
    }

    function deleteTodo(id) {
        update((s) => {
            s.todos = s.todos.filter((t) => t.id !== id);
        });
    }

    const todayTodos = state.todos.filter((t) => t.date === dk);
    const doneTodos = todayTodos.filter((t) => t.done);
    const pendingTodos = todayTodos.filter((t) => !t.done);

    return (
        <div>
            <div className="page-title">Todo List</div>

            <div className="section-label">Daily routine</div>
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

            <div className="section-label">Flexible zone — aaj ke extra tasks</div>
            <div className="card">
                <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Naya task add karo..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTodo()}
                        style={{ flex: 1 }}
                    />
                    <button className="btn primary sm" onClick={addTodo}>Add</button>
                </div>

                {pendingTodos.length === 0 && doneTodos.length === 0 && (
                    <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>
                        Koi extra task nahi — add karo upar se.
                    </div>
                )}

                {pendingTodos.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}>
                        <div className="cb" onClick={() => toggleTodo(t.id)} style={{ cursor: "pointer" }} />
                        <span style={{ flex: 1, fontSize: 14 }}>{t.text}</span>
                        <button onClick={() => deleteTodo(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                    </div>
                ))}

                {doneTodos.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}>
                        <div className="cb on" onClick={() => toggleTodo(t.id)} style={{ cursor: "pointer" }} />
                        <span style={{ flex: 1, fontSize: 14, textDecoration: "line-through", color: "var(--muted)" }}>{t.text}</span>
                        <button onClick={() => deleteTodo(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}