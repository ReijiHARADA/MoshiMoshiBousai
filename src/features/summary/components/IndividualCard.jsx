/**
 * 個別質問カード（人によって違う質問）。緑カード。
 */
export function IndividualCard({ card, users, displayText }) {
    const { question, cohabitingAnswers, separateAnswers } = card;
    const allAnswers = [...cohabitingAnswers, ...separateAnswers];

    return (
        <div className="flex-1 bg-success rounded-card flex flex-col shadow-xl overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <h3 className="font-bold text-white leading-[135%] mb-3 whitespace-pre-line" style={{ fontSize: 'clamp(18px, 5vw, 20px)' }}>
                    {displayText(question.text)}
                </h3>

                <div className="space-y-3">
                    {allAnswers.map(({ user, answerText, memoText: memo }) => (
                        <div key={user.id} className="bg-white rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                            <span className="inline-flex justify-center items-center bg-success text-white rounded-pill px-3 py-1 text-sm font-bold flex-shrink-0">
                                {user.name}
                            </span>
                            <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                                <p className="text-success font-bold text-sm leading-snug">{user.location || user.attributes?.location || '—'}</p>
                                <p className="text-success text-base leading-none my-1">↓</p>
                                <p className="text-success font-bold text-base leading-snug">{answerText || '—'}</p>
                                {memo && <p className="text-success/60 text-xs mt-2 leading-relaxed font-medium">{memo}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
