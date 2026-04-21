import { useState } from "react";

export default function Reading({ state, update }) {
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: "", author: "", totalPages: "", dailyTarget: 25, status: "active" });
    const [sessionBook, setSessionBook] = useState(null);
    const [sessionForm, setSessionForm] = useState({ from: "", to: "", note: "" });

    const books = state.books || [];
    const active = books.filter((b) => b.status === "active");
    const queue = books.filter((b) => b.status === "queue");
    const finished = books.filter((b) => b.status === "finished");

    function addBook() {
        if (!form.name.trim() || !form.totalPages) return;
        update((s) => {
            s.books.push({
                id: Date.now().toString(),
                name: form.name.trim(),
                author: form.author.trim(),
                totalPages: Number(form.totalPages),
                dailyTarget: Number(form.dailyTarget) || 25,
                currentPage: 0,
                status: form.status,
                sessions: [],
                addedOn: new Date().toISOString().slice(0, 10),
            });
        });
        setForm({ name: "", author: "", totalPages: "", dailyTarget: 25, status: "active" });
        setAdding(false);
    }

    function logSession() {
        const from = Number(sessionForm.from);
        const to = Number(sessionForm.to);
        if (!from || !to || to <= from) return alert("Pages galat hain.");
        update((s) => {
            const b = s.books.find((b) => b.id === sessionBook);
            if (!b) return;
            b.currentPage = to;
            b.sessions.push({
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                from, to, pages: to - from,
                note: sessionForm.note.trim(),
            });
            if (b.currentPage >= b.totalPages) b.status = "finished";
        });
        setSessionBook(null);
        setSessionForm({ from: "", to: "", note: "" });
    }

    function removeBook(id) {
        if (!confirm("Book delete karna hai?")) return;
        update((s) => { s.books = s.books.filter((b) => b.id !== id); });
    }

    function changeStatus(id, status) {
        update((s) => {
            const b = s.books.find((b) => b.id === id);
            if (b) b.status = status;
        });
    }

    function BookCard({ book }) {
        const pagesLeft = book.totalPages - book.currentPage;
        const pct = Math.round((book.currentPage / book.totalPages) * 100);
        const eta = book.dailyTarget > 0 ? Math.ceil(pagesLeft / book.dailyTarget) : "—";
        const totalRead = book.sessions.reduce((a, s) => a + s.pages, 0);

        return (
            <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{book.name}</div>
                        {book.author && <div style={{ fontSize: 12, color: "var(--muted)" }}>{book.author}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn sm" onClick={() => { setSessionBook(book.id); setSessionForm({ from: book.currentPage.toString(), to: "", note: "" }); }}>
                            Log session
                        </button>
                        <button className="btn sm danger" onClick={() => removeBook(book.id)}>×</button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--muted)", marginBottom: 10, flexWrap: "wrap" }}>
                    <span>Page {book.currentPage}/{book.totalPages}</span>
                    <span>{pagesLeft} pages left</span>
                    <span>ETA: {eta} days</span>
                    <span>Total read: {totalRead} pages</span>
                </div>

                <div className="prog-track" style={{ marginBottom: 10 }}>
                    <div className="prog-fill" style={{ width: pct + "%" }} />
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["active", "queue", "finished"].map(s => (
                        <button key={s} className={`btn sm${book.status === s ? " primary" : ""}`} onClick={() => changeStatus(book.id, s)}>
                            {s === "active" ? "Reading" : s === "queue" ? "Queue" : "Finished"}
                        </button>
                    ))}
                </div>

                {book.sessions.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>Recent sessions</div>
                        {book.sessions.slice(-3).reverse().map((s, i) => (
                            <div key={i} style={{ fontSize: 12, color: "var(--muted)", padding: "4px 0", borderBottom: "0.5px solid var(--border)" }}>
                                {s.date} {s.time} — {s.pages} pages (p.{s.from}→{s.to}){s.note ? ` — ${s.note}` : ""}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="page-title">Reading</div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div className="section-label" style={{ marginBottom: 0 }}>Books</div>
                <button className="btn primary sm" onClick={() => setAdding(!adding)}>
                    {adding ? "Cancel" : "+ Add book"}
                </button>
            </div>

            {adding && (
                <div className="card" style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input type="text" placeholder="Book ka naam *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        <input type="text" placeholder="Author (optional)" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                            <input type="text" placeholder="Total pages *" value={form.totalPages} onChange={e => setForm(f => ({ ...f, totalPages: e.target.value }))} style={{ flex: 1 }} />
                            <input type="text" placeholder="Daily target" value={form.dailyTarget} onChange={e => setForm(f => ({ ...f, dailyTarget: e.target.value }))} style={{ flex: 1 }} />
                        </div>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="active">Currently reading</option>
                            <option value="queue">Queue (up next)</option>
                        </select>
                        <button className="btn primary" onClick={addBook}>Add Book</button>
                    </div>
                </div>
            )}

            {sessionBook && (
                <div className="card" style={{ marginBottom: "1.25rem", border: "0.5px solid var(--green)" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                        Log session — {books.find(b => b.id === sessionBook)?.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input type="text" placeholder="From page" value={sessionForm.from} onChange={e => setSessionForm(f => ({ ...f, from: e.target.value }))} style={{ flex: 1 }} />
                        <input type="text" placeholder="To page" value={sessionForm.to} onChange={e => setSessionForm(f => ({ ...f, to: e.target.value }))} style={{ flex: 1 }} />
                    </div>
                    <input type="text" placeholder="Note (optional)" value={sessionForm.note} onChange={e => setSessionForm(f => ({ ...f, note: e.target.value }))} style={{ marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn primary sm" onClick={logSession}>Save</button>
                        <button className="btn sm" onClick={() => setSessionBook(null)}>Cancel</button>
                    </div>
                </div>
            )}

            {active.length > 0 && (
                <>
                    <div className="section-label">Currently reading</div>
                    {active.map(b => <BookCard key={b.id} book={b} />)}
                </>
            )}
            {queue.length > 0 && (
                <>
                    <div className="section-label" style={{ marginTop: 8 }}>Up next</div>
                    {queue.map(b => <BookCard key={b.id} book={b} />)}
                </>
            )}
            {finished.length > 0 && (
                <>
                    <div className="section-label" style={{ marginTop: 8 }}>Finished</div>
                    {finished.map(b => <BookCard key={b.id} book={b} />)}
                </>
            )}
            {books.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 14, padding: "2rem 0" }}>
                    Koi book nahi — upar se add karo.
                </div>
            )}
        </div>
    );
}