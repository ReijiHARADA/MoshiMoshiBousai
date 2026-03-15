/**
 * 質問文のテンプレート変数を置換する純粋関数。
 * {prevAnswer:qX} / {location} / {otherText} を answers と currentUser で解決する。
 */
export function resolveQuestionText(text, answers, currentUser) {
    if (!text) return '';
    let resolved = text.replace(/\{prevAnswer:(\w+)\}/g, (_, qId) => {
        return (answers && answers[qId]) || '___';
    });
    const location = currentUser?.location ?? '___';
    const otherText = currentUser?.attributes?.otherText ?? '___';
    resolved = resolved.replace(/\{location\}/g, location);
    resolved = resolved.replace(/\{otherText\}/g, otherText);
    return resolved;
}
