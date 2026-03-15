import { useMemo, useCallback } from 'react';
import { QUESTIONS } from '../../../data/questions';

/**
 * Summary ページ用の表示データ導出。
 * questionCards / 合意数 / 管理者抜け道 / displayText などを UI から分離する。
 */
export function useSummaryCards(users, answers, agreements) {
    const cohabitingUsers = useMemo(
        () => (users || []).filter((u) => u.isCohabiting !== false),
        [users]
    );
    const separateUsers = useMemo(
        () => (users || []).filter((u) => u.isCohabiting === false),
        [users]
    );

    const questionCards = useMemo(() => {
        const ans = answers || [];
        const ags = agreements || [];
        const answeredQuestionIds = new Set(ans.map((a) => a.questionId));
        return QUESTIONS.filter(
            (q) => q.targetAttribute === 'all' || answeredQuestionIds.has(q.id)
        ).map((question) => {
            const isIndividual = /\{(location|otherText)\}/.test(question.text);
            const cohabitingAnswers = cohabitingUsers.map((user) => {
                const a = ans.find((e) => e.questionId === question.id && e.userId === user.id);
                return { user, answerText: a?.answerText || '', memoText: a?.memoText || '' };
            });
            const separateAnswers = separateUsers.map((user) => {
                const a = ans.find((e) => e.questionId === question.id && e.userId === user.id);
                return { user, answerText: a?.answerText || '', memoText: a?.memoText || '' };
            });
            const agreement = ags.find((a) => a.questionId === question.id);
            const cohabitingTexts = cohabitingAnswers
                .map((a) => a.answerText.trim())
                .filter((t) => t.length > 0);
            const allMatch =
                cohabitingTexts.length > 0 &&
                cohabitingTexts.every((t) => t === cohabitingTexts[0]);
            const isAgreed = isIndividual || !!agreement || allMatch;
            return {
                question,
                cohabitingAnswers,
                separateAnswers,
                agreement,
                allMatch,
                isAgreed,
                isIndividual,
            };
        });
    }, [cohabitingUsers, separateUsers, answers, agreements]);

    const agreedCount = questionCards.filter((c) => c.isAgreed).length;
    const totalCount = questionCards.length;

    const adminBypass = useMemo(() => {
        const firstIsQ1 = questionCards[0]?.question?.id === 'q1';
        const q1Agreement = (agreements || []).find((a) => a.questionId === 'q1');
        const memoIsAdmin = (q1Agreement?.memoText || '').trim().toLowerCase() === 'admin';
        return !!(firstIsQ1 && q1Agreement && memoIsAdmin);
    }, [questionCards, agreements]);

    const canCreateSheet = agreedCount >= totalCount || adminBypass;

    const displayText = useCallback(
        (text) => {
            if (!text) return '';
            const ags = agreements || [];
            let resolved = text.replace(/\{prevAnswer:(\w+)\}/g, (_, qId) => {
                const ag = ags.find((a) => a.questionId === qId);
                if (ag) return ag.agreedText;
                const card = questionCards.find((c) => c.question.id === qId);
                if (card && card.allMatch) {
                    const first = card.cohabitingAnswers.find(
                        (a) => a.answerText.trim().length > 0
                    );
                    if (first) return first.answerText;
                }
                return '__';
            });
            resolved = resolved.replace(/\{location\}/g, '[よくいる場所]');
            resolved = resolved.replace(/\{otherText\}/g, '[その他]');
            return resolved;
        },
        [agreements, questionCards]
    );

    return {
        questionCards,
        cohabitingUsers,
        separateUsers,
        agreedCount,
        totalCount,
        canCreateSheet,
        displayText,
    };
}
