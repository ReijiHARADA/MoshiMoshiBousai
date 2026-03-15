const CURRENT_USER_KEY = 'currentUser';

/**
 * localStorage の currentUser アクセスを集約する。
 * JSON parse/stringify と例外処理はここで吸収する。
 */

export function getCurrentUser() {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CURRENT_USER_KEY) : null;
        if (raw == null) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function setCurrentUser(user) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
    } catch (err) {
        console.error('setCurrentUser failed:', err);
    }
}

export function clearCurrentUser() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    } catch (err) {
        console.error('clearCurrentUser failed:', err);
    }
}
