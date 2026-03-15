import { useState, useEffect } from 'react';

/**
 * 質問タイトル高さの最大値計測（入力位置を揃えるため）。
 * rulerRef の子要素の高さを計測し、titleMinHeight を返す。
 */
export function useQuestionTitleMeasure(rulerRef, filteredQuestions, answers, currentUser, slideWidth, cardWidth) {
    const [titleMinHeight, setTitleMinHeight] = useState(null);

    useEffect(() => {
        if (!slideWidth || filteredQuestions.length === 0 || cardWidth <= 40) return;
        const id = requestAnimationFrame(() => {
            const el = rulerRef.current;
            if (!el || !el.children.length) return;
            const heights = Array.from(el.children).map((child) => child.offsetHeight);
            const max = Math.max(...heights);
            setTitleMinHeight(max);
        });
        return () => cancelAnimationFrame(id);
    }, [filteredQuestions, slideWidth, cardWidth, answers, currentUser]);

    return titleMinHeight;
}
