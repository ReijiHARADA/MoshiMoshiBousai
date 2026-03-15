/**
 * 単一質問カード。タイトル・入力欄・メモ欄。q3/q4 は teal (bg-success) に切り替え。
 */
export function QuestionCard({
    question,
    index,
    dispTot,
    answerValue,
    memoValue,
    titleMinHeight,
    onAnswerChange,
    onMemoChange,
    resolvedText,
}) {
    const isTeal = question.id === 'q3' || question.id === 'q4';
    const cardClass = isTeal ? 'bg-success' : 'bg-primary';
    const memoWrapClass = isTeal ? 'bg-[#1F685D]' : 'bg-[#123C4B]';
    const memoLabelClass = isTeal ? 'text-success/50' : 'text-primary/50';
    const memoInputClass = isTeal ? 'text-success placeholder-success/30' : 'text-primary placeholder-primary/30';

    return (
        <div className="h-full flex-shrink-0 flex flex-col py-1" style={{ width: '100%' }}>
            <div className={`flex-1 rounded-card px-5 py-4 flex flex-col shadow-xl overflow-hidden min-h-0 ${cardClass}`}>
                <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white/20 rounded-full text-white text-sm font-bold">
                        {String(index + 1).padStart(2, '0')}/{dispTot}
                    </span>
                </div>
                <h2
                    className="font-bold text-white leading-[135%] mb-3 whitespace-pre-line flex-shrink-0"
                    style={{
                        fontSize: 'clamp(29px, 8vw, 36px)',
                        minHeight: titleMinHeight != null ? titleMinHeight : undefined,
                    }}
                >
                    {resolvedText}
                </h2>
                <input
                    type="text"
                    value={answerValue || ''}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface text-text placeholder-text-muted text-[16px] font-medium focus:outline-none transition-all mb-3"
                />
                <div className={`flex-1 rounded-xl px-4 py-2 flex flex-col min-h-[48px] ${memoWrapClass}`}>
                    <p className={`text-[10px] mb-0.5 ${memoLabelClass}`}>メモ用欄</p>
                    <textarea
                        value={memoValue || ''}
                        onChange={(e) => onMemoChange(question.id, e.target.value)}
                        placeholder={question.memo}
                        rows={2}
                        className={`w-full flex-1 bg-transparent text-xs focus:outline-none resize-none ${memoInputClass}`}
                    />
                </div>
            </div>
        </div>
    );
}
