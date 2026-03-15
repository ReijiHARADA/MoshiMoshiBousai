/**
 * ルーム参加用URLを生成する。
 * @param {string} roomId
 * @returns {string}
 */
export function buildRoomUrl(roomId) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/join/${roomId}`;
}

/**
 * テキストをクリップボードにコピーする。
 * まず navigator.clipboard.writeText を試し、失敗時は document.execCommand('copy') でフォールバックする。
 * @param {string} text
 * @returns {Promise<boolean>} コピー成功なら true、失敗なら false
 */
export async function copyText(text) {
    if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * ルームの共有を試みる。
 * navigator.share が使える場合は共有ダイアログを出し、キャンセルまたは未対応時は copyOnFail なら URL をコピーする。
 * @param {string} roomId
 * @param {{ title?: string, copyOnFail?: boolean }} [options]
 * @param {string} [options.title='もしもし防災']
 * @param {boolean} [options.copyOnFail=true]
 * @returns {Promise<{ shared: true } | { copied: true } | { copied: false }>}
 */
export async function shareRoom(roomId, options = {}) {
    const { title = 'もしもし防災', copyOnFail = true } = options;
    const url = buildRoomUrl(roomId);
    if (typeof navigator === 'undefined') return { copied: false };

    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return { shared: true };
        } catch {
            // ユーザーキャンセルやエラー時はフォールバックへ
        }
    }

    if (!copyOnFail) return { copied: false };
    const ok = await copyText(url);
    return ok ? { copied: true } : { copied: false };
}
