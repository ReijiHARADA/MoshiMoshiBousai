import { IndividualCard } from './IndividualCard';
import { SummaryCard } from './SummaryCard';

/**
 * カルーセル＋インジケーター＋防災シート作成ボタン。カード一覧表示の責務。
 */
export function SummaryCarousel({
    containerRef,
    trackTranslatePx,
    isDragging,
    suppressTrackTransition,
    cardGap,
    cardWidth,
    questionCards,
    users,
    displayText,
    onExpandCard,
    setCardRef,
    onCardClick,
    showChrome,
    chromeInstantShow,
    currentIndex,
    indicatorColor,
    canCreateSheet,
    onOpenSheetModal,
}) {
    return (
        <>
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden min-h-0 transition-opacity duration-300"
                style={{
                    opacity: showChrome ? 1 : 0,
                    pointerEvents: showChrome ? 'auto' : 'none',
                    transition: chromeInstantShow ? 'none' : undefined,
                }}
            >
                <div
                    className="h-full flex"
                    style={{
                        transform: `translate3d(${trackTranslatePx}px, 0, 0)`,
                        transition:
                            isDragging || suppressTrackTransition
                                ? 'none'
                                : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                        willChange: 'transform',
                        gap: `${cardGap}px`,
                        paddingBottom: '150px',
                    }}
                >
                    {questionCards.map((card, idx) => (
                        <div
                            key={card.question.id}
                            className="h-full flex-shrink-0 flex flex-col py-1"
                            style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                            onClick={onCardClick}
                        >
                            {card.isIndividual ? (
                                <IndividualCard
                                    card={card}
                                    users={users}
                                    displayText={displayText}
                                />
                            ) : (
                                <SummaryCard
                                    card={card}
                                    displayText={displayText}
                                    onExpand={() => onExpandCard(idx)}
                                    cardRef={(el) => setCardRef(idx, el)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="absolute left-0 right-0 px-5 pointer-events-none transition-opacity duration-300"
                style={{
                    bottom: '16px',
                    opacity: showChrome ? 1 : 0,
                    pointerEvents: showChrome ? 'auto' : 'none',
                    backgroundColor: 'transparent',
                }}
            >
                <div className="relative z-10 flex justify-center items-center gap-2 mb-4 drop-shadow-[0_8px_14px_rgba(93,93,93,0.22)] pointer-events-auto">
                    {questionCards.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all"
                            style={{
                                width: i === currentIndex ? '24px' : '8px',
                                height: '8px',
                                backgroundColor: i === currentIndex ? indicatorColor : '#C5C5C5',
                            }}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    disabled={!canCreateSheet}
                    onClick={onOpenSheetModal}
                    className="w-full h-[53px] rounded-full font-bold text-[24px] transition-all active:scale-[0.98] disabled:cursor-not-allowed pointer-events-auto"
                    style={{
                        backgroundColor: canCreateSheet ? 'var(--color-accent)' : 'var(--color-disabled)',
                        color: canCreateSheet ? 'var(--color-on-primary)' : 'var(--color-muted)',
                    }}
                >
                    防災シート作成
                </button>
                {!canCreateSheet && (
                    <p className="text-disabled text-[12px] text-justify mt-2 leading-[1.4]">
                        全ての項目が合意されないと防災シートを作成することはできません。
                    </p>
                )}
            </div>
        </>
    );
}
