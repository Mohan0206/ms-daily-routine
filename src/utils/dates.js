export function today() {
    return new Date().toISOString().slice(0, 10);
}

export function dayDiff(a, b) {
    return Math.floor((new Date(b) - new Date(a)) / 86400000);
}

export function dayPct(completions, dk, tasks) {
    const c = completions[dk] || {};
    return Math.round((Object.keys(c).length / tasks.length) * 100);
}

export function getStreak(completions, start, tasks) {
    if (!start) return 0;
    const td = today();
    let streak = dayPct(completions, td, tasks) >= 80 ? 1 : 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
        const dk = d.toISOString().slice(0, 10);
        if (dayDiff(start, dk) < 0) break;
        if (dayPct(completions, dk, tasks) >= 80) streak++;
        else break;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

export function getAvg(completions, start, tasks) {
    if (!start) return 0;
    const td = today();
    const days = dayDiff(start, td) + 1;
    let total = 0;
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        total += dayPct(completions, d.toISOString().slice(0, 10), tasks);
    }
    return Math.round(total / days);
}

export function getWeekDates(weekOffset = 0) {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7) + weekOffset * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

export function getMonthDates(monthOffset = 0) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const dates = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

export function formatDate(dk) {
    return new Date(dk).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}