import { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSwipeCarousel } from '../hooks/useSwipeCarousel';
import { shareRoom } from '../lib/share';
import { resolveQuestionText } from '../features/questions/utils/resolveQuestionText';
import { useQuestionSession } from '../features/questions/hooks/useQuestionSession';
import { useQuestionTitleMeasure } from '../features/questions/hooks/useQuestionTitleMeasure';
import { QuestionCard } from '../features/questions/components/QuestionCard';
import { CompletionCard } from '../features/questions/components/CompletionCard';

export default function Questions() {
    const { roomId } = useParams();
    const rulerRef = useRef(null);

    const {
        currentUser,
        filteredQuestions,
        answers,
        memos,
        saving,
        allAnswered,
        firstUnansweredIndex,
        handleAnswerChange,
        handleMemoChange,
        handleSaveAndNavigate,
        isExiting,
    } = useQuestionSession(roomId);

    const totalQuestions = filteredQuestions.length;
    const totalSlides = totalQuestions + 1;

    const {
        containerRef,
        currentIndex,
        setCurrentIndex,
        isDragging,
        slideWidth,
        trackTranslatePx,
        cardWidth,
        cardGap,
        goNext,
        goPrev,
    } = useSwipeCarousel({ itemCount: totalSlides });

    const titleMinHeight = useQuestionTitleMeasure(
        rulerRef,
        filteredQuestions,
        answers,
        currentUser,
        slideWidth,
        cardWidth
    );

    const getResolvedText = useCallback(
        (text) => resolveQuestionText(text, answers, currentUser),
        [answers, currentUser]
    );

    const handleCardClick = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (currentIndex >= totalQuestions) return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardCenter = rect.width / 2;
        if (clickX > cardCenter) goNext();
        else goPrev();
    };

    const goToFirstUnanswered = () => setCurrentIndex(firstUnansweredIndex);

    const handleCompletionCardClick = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardCenter = rect.width / 2;
        if (clickX > cardCenter) {
            if (allAnswered) handleSaveAndNavigate();
            else goToFirstUnanswered();
        } else {
            goPrev();
        }
    };

    const [showCopied, setShowCopied] = useState(false);
    const handleShare = async () => {
        const result = await shareRoom(roomId);
        if (result.copied) {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const isOnCompletion = currentIndex >= totalQuestions;
    const dispTot = String(totalQuestions).padStart(2, '0');
    const currentQuestion = !isOnCompletion ? filteredQuestions[currentIndex] : null;
    const isTealCard = currentQuestion && (currentQuestion.id === 'q3' || currentQuestion.id === 'q4');
    const indicatorColor = isTealCard ? 'var(--color-success)' : 'var(--color-primary)';

    return (
        <div
            className="h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden overscroll-none relative"
            style={{
                backgroundColor: '#ffffff',
                opacity: isExiting ? 0 : 1,
                transform: isExiting ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
        >
            {cardWidth > 40 && (
                <div
                    ref={rulerRef}
                    aria-hidden="true"
                    className="absolute left-0 top-0 pointer-events-none invisible"
                    style={{ width: cardWidth - 40 }}
                >
                    {filteredQuestions.map((question) => (
                        <div
                            key={question.id}
                            className="font-bold leading-[135%] whitespace-pre-line"
                            style={{ fontSize: 'clamp(29px, 8vw, 36px)' }}
                        >
                            {getResolvedText(question.text || '')}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                <div />
                <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 rounded-full px-3 h-9 text-[16px] font-medium active:scale-95 transition-all bg-disabled text-white hover:bg-disabled-hover"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    {showCopied ? 'コピー済み' : '共有'}
                </button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-x-hidden overflow-y-visible min-h-0">
                <div
                    className="h-full flex"
                    style={{
                        transform: `translate3d(${trackTranslatePx}px, 0, 0)`,
                        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                        willChange: 'transform',
                        gap: `${cardGap}px`,
                        paddingBottom: '40px',
                    }}
                >
                    {filteredQuestions.map((question, index) => (
                        <div
                            key={question.id}
                            className="h-full flex-shrink-0 flex flex-col py-1"
                            style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                            onClick={handleCardClick}
                        >
                            <QuestionCard
                                question={question}
                                index={index}
                                dispTot={dispTot}
                                answerValue={answers[question.id]}
                                memoValue={memos[question.id]}
                                titleMinHeight={titleMinHeight}
                                onAnswerChange={handleAnswerChange}
                                onMemoChange={handleMemoChange}
                                resolvedText={getResolvedText(question.text || '質問文が設定されていません')}
                            />
                        </div>
                    ))}

                    <div
                        className="h-full flex-shrink-0 flex flex-col py-1"
                        style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                        onClick={handleCompletionCardClick}
                    >
                        <CompletionCard
                            allAnswered={allAnswered}
                            totalQuestions={totalQuestions}
                            saving={saving}
                            dispTot={dispTot}
                            onSaveAndNavigate={handleSaveAndNavigate}
                            onGoToFirstUnanswered={goToFirstUnanswered}
                        />
                    </div>
                </div>
            </div>

            <div className="absolute left-0 right-0 pb-3 pt-0 -mt-1 pointer-events-none" style={{ bottom: '0', backgroundColor: 'transparent' }}>
                <div className="relative z-10 flex justify-center items-center gap-2 pointer-events-auto drop-shadow-[0_8px_14px_rgba(93,93,93,0.22)]">
                    {filteredQuestions.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all"
                            style={{
                                width: i === currentIndex && !isOnCompletion ? '24px' : '8px',
                                height: '8px',
                                backgroundColor: i === currentIndex && !isOnCompletion ? indicatorColor : '#C5C5C5',
                            }}
                        />
                    ))}
                </div>
            </div>

            {showCopied && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white rounded-pill shadow-lg text-sm font-bold text-primary animate-[fadeInUp_0.2s_ease-out]">
                    リンクをコピーしました！
                </div>
            )}
        </div>
    );
}
