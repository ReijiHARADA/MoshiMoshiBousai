import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation } from 'react-router-dom';
import { useSwipeCarousel } from '../hooks/useSwipeCarousel';
import { shareRoom } from '../lib/share';
import { haptics } from '../lib/haptics';
import { useSummaryData } from '../features/summary/hooks/useSummaryData';
import { useSummaryCards } from '../features/summary/hooks/useSummaryCards';
import { SummaryCarousel } from '../features/summary/components/SummaryCarousel';
import { AgreementOverlay } from '../features/summary/components/AgreementOverlay';
import { SheetModal } from '../features/summary/components/SheetModal';

export default function Summary() {
    const { roomId } = useParams();
    const location = useLocation();
    const fromQuestions = location.state?.fromQuestions ?? false;
    const [hasEntered, setHasEntered] = useState(!fromQuestions);

    const { users, answers, agreements } = useSummaryData(roomId);
    const {
        questionCards,
        cohabitingUsers,
        separateUsers,
        agreedCount,
        totalCount,
        canCreateSheet,
        displayText,
    } = useSummaryCards(users, answers, agreements);

    const [expandedCard, setExpandedCard] = useState(null);
    const [overlayState, setOverlayState] = useState('closed');
    const [targetRect, setTargetRect] = useState(/** @type {{ top: number; left: number; width: number; height: number } | null} */ (null));
    const [showChrome, setShowChrome] = useState(true);
    const [showCopied, setShowCopied] = useState(false);
    const [showSheetModal, setShowSheetModal] = useState(false);
    const [isClosingOverlay, setIsClosingOverlay] = useState(false);

    const overlayCardRefs = useRef({});
    const pendingAgreementRef = useRef(null);
    const openCardRectRef = useRef(null);
    const closingCardIndexRef = useRef(null);
    const [suppressTrackTransition, setSuppressTrackTransition] = useState(false);
    const [chromeInstantShow, setChromeInstantShow] = useState(false);
    const expandedRef = useRef(null);
    useEffect(() => {
        expandedRef.current = expandedCard;
    }, [expandedCard]);

    const getCardRect = (idx) => {
        const el = overlayCardRefs.current[idx];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height };
    };

    const openOverlay = (idx) => {
        const rect = getCardRect(idx);
        openCardRectRef.current = rect;
        setExpandedCard(idx);
        setCurrentIndex(idx);
        setShowChrome(false);
        setTargetRect(rect);
        setOverlayState('opening');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setOverlayState('open'));
        });
    };

    const requestCloseOverlay = () => {
        closingCardIndexRef.current = expandedCard;
        const rect = openCardRectRef.current ?? getCardRect(expandedCard);
        setTargetRect(rect);
        setIsClosingOverlay(true);
        setOverlayState('closing');
    };

    const finishCloseOverlay = () => {
        const indexToRestore = closingCardIndexRef.current;
        closingCardIndexRef.current = null;
        setOverlayState('closed');
        setExpandedCard(null);
        setTargetRect(null);
        openCardRectRef.current = null;
        setIsClosingOverlay(false);
        if (indexToRestore !== null && indexToRestore !== undefined) {
            setCurrentIndex(indexToRestore);
        }
        pendingAgreementRef.current = null;
        setSuppressTrackTransition(true);
        setChromeInstantShow(true);
        setShowChrome(true);
        setTimeout(() => {
            setSuppressTrackTransition(false);
            setChromeInstantShow(false);
        }, 50);
    };

    useEffect(() => {
        if (fromQuestions) {
            const id = requestAnimationFrame(() => setHasEntered(true));
            return () => cancelAnimationFrame(id);
        }
    }, [fromQuestions]);

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
    } = useSwipeCarousel({ itemCount: totalCount, disableDragRef: expandedRef });

    const handleOpenSheetModal = () => {
        haptics.success();
        setShowSheetModal(true);
    };

    const handleShare = async () => {
        const result = await shareRoom(roomId);
        if (result.copied) {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const handleCardClick = (e) => {
        if (expandedCard !== null || isClosingOverlay) return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardCenter = rect.width / 2;
        if (clickX > cardCenter) {
            goNext();
        } else {
            goPrev();
        }
    };

    if (totalCount === 0) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <p className="text-disabled text-sm">読み込み中...</p>
            </div>
        );
    }

    const currentCard = expandedCard !== null ? questionCards[expandedCard] : null;
    const displayedCard = questionCards[currentIndex];
    const indicatorColor = displayedCard?.isIndividual ? 'var(--color-success)' : 'var(--color-primary)';

    return (
        <div
            className="h-[100dvh] max-h-[100dvh] relative overflow-hidden overscroll-none bg-white flex flex-col"
            style={{
                opacity: hasEntered ? 1 : 0,
                transform: hasEntered ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
            }}
        >
            <div
                className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0 transition-all duration-300"
                style={{ opacity: showChrome ? 1 : 0, pointerEvents: showChrome ? 'auto' : 'none' }}
            >
                <div
                    className="flex items-center gap-3 rounded-full px-3 h-9"
                    style={{ backgroundColor: agreedCount >= totalCount ? 'var(--color-dark)' : 'var(--color-accent)' }}
                >
                    <span className="text-on-primary font-medium text-[16px]">合意数</span>
                    <span className="text-on-primary font-bold text-[20px]">{agreedCount}/{totalCount}</span>
                </div>
                <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 rounded-full px-3 h-9 bg-disabled text-on-primary text-[16px] font-medium hover:bg-disabled-hover active:scale-95 transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    {showCopied ? 'コピー済み' : '共有'}
                </button>
            </div>

            <SummaryCarousel
                containerRef={containerRef}
                trackTranslatePx={trackTranslatePx}
                isDragging={isDragging}
                suppressTrackTransition={suppressTrackTransition}
                cardGap={cardGap}
                cardWidth={cardWidth}
                questionCards={questionCards}
                users={users}
                displayText={displayText}
                onExpandCard={openOverlay}
                setCardRef={(idx, el) => { overlayCardRefs.current[idx] = el; }}
                onCardClick={handleCardClick}
                showChrome={showChrome}
                chromeInstantShow={chromeInstantShow}
                currentIndex={currentIndex}
                indicatorColor={indicatorColor}
                canCreateSheet={canCreateSheet}
                onOpenSheetModal={handleOpenSheetModal}
            />

            {typeof document !== 'undefined' && document.body && overlayState !== 'closed' && createPortal(
                <AgreementOverlay
                    card={currentCard}
                    overlayState={overlayState}
                    targetRect={targetRect}
                    contentMaxWidth={slideWidth || (typeof window !== 'undefined' ? window.innerWidth - 48 : 400)}
                    roomId={roomId}
                    displayText={displayText}
                    onClose={requestCloseOverlay}
                    onClosed={finishCloseOverlay}
                    onAgreed={(agreementData) => {
                        pendingAgreementRef.current = agreementData;
                        requestCloseOverlay();
                    }}
                />,
                document.body
            )}

            {showSheetModal && (
                <SheetModal
                    onClose={() => setShowSheetModal(false)}
                    questionCards={questionCards}
                    agreements={agreements}
                    answers={answers}
                    users={users}
                    cohabitingUsers={cohabitingUsers}
                    separateUsers={separateUsers}
                />
            )}

            <div
                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-bold text-primary transition-all duration-300"
                style={{ opacity: showCopied ? 1 : 0, pointerEvents: showCopied ? 'auto' : 'none' }}
            >
                リンクをコピーしました！
            </div>
        </div>
    );
}
