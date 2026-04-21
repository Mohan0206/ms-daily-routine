const KEY = "ms_routine_v1";

export function loadState() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { }
    return defaultState();
}

export function saveState(state) {
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { }
}

export function defaultState() {
    return {
        start: null,
        completions: {},
        todos: [],
        books: [],
        notes: [],
        reminders: [],
        settings: {
            customTasks: [],
        },
    };
}