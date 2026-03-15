/**
 * クライアント用の一意IDを生成する。
 * http 環境（LANテスト等）では crypto.randomUUID が使えないためフォールバックを用意。
 */
export function createClientId() {
    if (typeof window !== 'undefined' && window.crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
