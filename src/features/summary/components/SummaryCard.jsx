/**
 * カルーセル内のカード（非展開時）。青カード。「話し合って修正」で展開。
 */
export function SummaryCard({ card, displayText, onExpand, cardRef }) {
    const { question, cohabitingAnswers, separateAnswers, agreement, isAgreed } = card;
    const badgeBg = isAgreed ? 'bg-dark' : 'bg-accent';
    const badgeText = isAgreed ? '合意済' : '✗ 未一致';

    return (
        <div
            ref={cardRef}
            className="flex-1 bg-primary rounded-card flex flex-col shadow-xl overflow-hidden min-h-0"
        >
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-0 flex flex-col min-h-0">
                <div className="mb-2 flex-shrink-0">
                    <span className={`inline-block px-3.5 py-1.5 rounded-full text-white text-sm font-bold ${badgeBg}`}>
                        {badgeText}
                    </span>
                </div>

                <h3 className="font-bold text-white leading-[135%] mb-3 whitespace-pre-line flex-shrink-0" style={{ fontSize: 'clamp(18px, 5vw, 20px)' }}>
                    {displayText(question.text)}
                </h3>

                {isAgreed && agreement ? (
                    <div className="flex items-start gap-3 mb-4 flex-shrink-0">
                        <span className="inline-block bg-white text-stone-900 rounded-full px-2 py-0.5 text-base font-medium flex-shrink-0 border border-white">
                            家族
                        </span>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-white font-bold text-xl">{agreement.agreedText}</p>
                            {agreement.memoText && <p className="text-white text-xs mt-1 leading-relaxed">{agreement.memoText}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 mb-4 flex-shrink-0">
                        {cohabitingAnswers.map(({ user, answerText, memoText: memo }) => (
                            <div key={user.id} className="flex items-start gap-3">
                                <span className="inline-block bg-white text-primary rounded-pill px-2 py-0.5 text-base font-medium flex-shrink-0 border border-white">
                                    {user.name}
                                </span>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-white font-bold text-xl">{answerText || '—'}</p>
                                    {memo && <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{memo}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-primary/40 text-xs text-justify mt-4 leading-relaxed flex-shrink-0">
                    答えが違っても大丈夫。いま話し合うことが、いざという時の安心に繋がります。
                </p>

                <div
                    className="mt-4 pt-3 border-t border-white/10 flex-shrink-0"
                    style={{ display: separateAnswers.length > 0 ? 'block' : 'none' }}
                >
                    <p className="text-white/40 text-xs font-bold mb-2">離れて暮らす家族</p>
                    <div className="space-y-2">
                        {separateAnswers.map(({ user, answerText }) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <span className="inline-block bg-white/10 text-white/60 rounded-full px-3 py-1 text-xs font-bold flex-shrink-0">
                                    {user.name}
                                </span>
                                <p className="text-white/60 text-sm">{answerText || '—'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 flex-shrink-0">
                <button
                    type="button"
                    onClick={onExpand}
                    className="w-full py-3 rounded-pill bg-white text-primary text-xl font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-button"
                >
                    話し合って修正
                </button>
            </div>
        </div>
    );
}
