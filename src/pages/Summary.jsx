import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QUESTIONS } from '../data/questions';
import { Phone, MessageSquare, Package, MapPin, PawPrint, Baby, Heart, ClipboardList, X, Download, Printer } from 'lucide-react';
import { toPng } from 'html-to-image';
import tips1Svg from '../assets/tips1.svg';
import tips2Svg from '../assets/tips2.svg';
import tips3Svg from '../assets/tips3.svg';
import tips4Svg from '../assets/tips4.svg';
import tips5Svg from '../assets/tips5.svg';
import tips6Svg from '../assets/tips6.svg';
import tips7Svg from '../assets/tips7.svg';

export default function Summary() {
    const { roomId } = useParams();
    const location = useLocation();
    const fromQuestions = location.state?.fromQuestions ?? false;
    const [hasEntered, setHasEntered] = useState(!fromQuestions);

    const [users, setUsers] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedCard, setExpandedCard] = useState(null);
    const [overlayState, setOverlayState] = useState('closed'); // 'closed' | 'opening' | 'open' | 'closing'
    const [targetRect, setTargetRect] = useState(/** @type {{ top: number; left: number; width: number; height: number } | null} */ (null));
    const [showChrome, setShowChrome] = useState(true);
    const [showCopied, setShowCopied] = useState(false);
    const [showSheetModal, setShowSheetModal] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [slideWidth, setSlideWidth] = useState(0);
    const [isClosingOverlay, setIsClosingOverlay] = useState(false);

    // Refs
    const overlayCardRefs = useRef({});
    const pendingAgreementRef = useRef(null);
    const openCardRectRef = useRef(null);
    const closingCardIndexRef = useRef(null);
    const [suppressTrackTransition, setSuppressTrackTransition] = useState(false);
    const [chromeInstantShow, setChromeInstantShow] = useState(false);
    const containerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isHorizontalSwipe = useRef(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef(0);
    const currentIndexRef = useRef(0);
    const expandedRef = useRef(null);

    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    useEffect(() => { expandedRef.current = expandedCard; }, [expandedCard]);

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
        setCurrentIndex(idx); // 開いたカードにカルーセルを合わせる（閉じるときの着地点がずれないように）
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
        const pending = pendingAgreementRef.current;
        if (pending) {
            pendingAgreementRef.current = null;
            setAgreements((prev) => {
                const filtered = prev.filter((a) => a.id !== pending.id);
                return [...filtered, pending];
            });
        }
        setSuppressTrackTransition(true);
        setChromeInstantShow(true);
        setShowChrome(true);
        setTimeout(() => {
            setSuppressTrackTransition(false);
            setChromeInstantShow(false);
        }, 50);
    };

    // Questions からの遷移時: 入りアニメーション
    useEffect(() => {
        if (fromQuestions) {
            const id = requestAnimationFrame(() => setHasEntered(true));
            return () => cancelAnimationFrame(id);
        }
    }, [fromQuestions]);

    // ---------- スクロール抑制 ----------
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;
        const prevBodyOverscroll = body.style.overscrollBehavior;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.overscrollBehavior = 'none';

        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
            body.style.overscrollBehavior = prevBodyOverscroll;
        };
    }, []);

    // ---------- Firestore ----------
    useEffect(() => {
        const usersQ = query(collection(db, 'users'), where('roomId', '==', roomId));
        const answersQ = query(collection(db, 'answers'), where('roomId', '==', roomId));
        const agreementsQ = query(collection(db, 'agreements'), where('roomId', '==', roomId));

        const unsub1 = onSnapshot(usersQ, (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        const unsub2 = onSnapshot(answersQ, (snap) => setAnswers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        const unsub3 = onSnapshot(agreementsQ, (snap) => setAgreements(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));

        return () => { unsub1(); unsub2(); unsub3(); };
    }, [roomId]);

    const cohabitingUsers = useMemo(() => users.filter((u) => u.isCohabiting !== false), [users]);
    const separateUsers = useMemo(() => users.filter((u) => u.isCohabiting === false), [users]);

    const questionCards = useMemo(() => {
        // 全員共通 + 誰か1人でも回答している属性別質問を表示
        const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
        return QUESTIONS.filter((q) => q.targetAttribute === 'all' || answeredQuestionIds.has(q.id)).map((question) => {
            // {location} や {otherText} を含む質問は「個別質問」（人によって内容が異なる）
            // {prevAnswer:xxx} のみの質問は共通質問（家族の合意が必要）
            const isIndividual = /\{(location|otherText)\}/.test(question.text);
            const cohabitingAnswers = cohabitingUsers.map((user) => {
                const ans = answers.find((a) => a.questionId === question.id && a.userId === user.id);
                return { user, answerText: ans?.answerText || '', memoText: ans?.memoText || '' };
            });
            const separateAnswers = separateUsers.map((user) => {
                const ans = answers.find((a) => a.questionId === question.id && a.userId === user.id);
                return { user, answerText: ans?.answerText || '', memoText: ans?.memoText || '' };
            });
            const agreement = agreements.find((a) => a.questionId === question.id);
            const cohabitingTexts = cohabitingAnswers.map((a) => a.answerText.trim()).filter((t) => t.length > 0);
            const allMatch = cohabitingTexts.length > 0 && cohabitingTexts.every((t) => t === cohabitingTexts[0]);
            // 個別質問は自動的に合意済み扱い
            const isAgreed = isIndividual || !!agreement || allMatch;
            return { question, cohabitingAnswers, separateAnswers, agreement, allMatch, isAgreed, isIndividual };
        });
    }, [cohabitingUsers, separateUsers, answers, agreements]);

    const agreedCount = questionCards.filter((c) => c.isAgreed).length;
    const totalCount = questionCards.length;

    // 管理者用抜け道: 1枚目（在宅時避難所）の詳細でメモに「admin」と入れて合意すると防災シート作成を有効にする
    const adminBypass = useMemo(() => {
        const firstIsQ1 = questionCards[0]?.question?.id === 'q1';
        const q1Agreement = agreements.find((a) => a.questionId === 'q1');
        const memoIsAdmin = (q1Agreement?.memoText || '').trim().toLowerCase() === 'admin';
        return !!(firstIsQ1 && q1Agreement && memoIsAdmin);
    }, [questionCards, agreements]);
    const canCreateSheet = agreedCount >= totalCount || adminBypass;

    // ---------- コンテナ幅 ----------
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => setSlideWidth(el.offsetWidth);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ---------- スワイプ ----------
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const startDrag = (x, y) => {
            touchStartX.current = x;
            touchStartY.current = y;
            isHorizontalSwipe.current = null;
            isDraggingRef.current = true;
            setIsDragging(true);
        };

        const moveDrag = (x, y, prevent) => {
            if (!isDraggingRef.current) return;
            if (expandedRef.current !== null) return;
            const dx = x - touchStartX.current;
            const dy = y - touchStartY.current;
            if (isHorizontalSwipe.current === null) {
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
                }
                return;
            }
            if (!isHorizontalSwipe.current) return;
            if (prevent) prevent();
            const idx = currentIndexRef.current;
            let offset = dx;
            if ((idx === 0 && dx > 0) || (idx >= totalCount - 1 && dx < 0)) offset = dx * 0.25;
            dragOffsetRef.current = offset;
            setDragOffset(offset);
        };

        const endDrag = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            setIsDragging(false);
            isHorizontalSwipe.current = null;
            const offset = dragOffsetRef.current;
            const idx = currentIndexRef.current;
            if (offset < -50 && idx < totalCount - 1) setCurrentIndex((p) => p + 1);
            else if (offset > 50 && idx > 0) setCurrentIndex((p) => p - 1);
            dragOffsetRef.current = 0;
            setDragOffset(0);
        };

        const onTS = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
        const onTM = (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
        const onTE = () => endDrag();
        const onMD = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        };
        const onMM = (e) => { if (isDraggingRef.current) moveDrag(e.clientX, e.clientY); };
        const onMU = () => endDrag();

        el.addEventListener('touchstart', onTS, { passive: true });
        el.addEventListener('touchmove', onTM, { passive: false });
        el.addEventListener('touchend', onTE, { passive: true });
        el.addEventListener('mousedown', onMD);
        el.addEventListener('mousemove', onMM);
        el.addEventListener('mouseup', onMU);
        el.addEventListener('mouseleave', onMU);

        return () => {
            el.removeEventListener('touchstart', onTS);
            el.removeEventListener('touchmove', onTM);
            el.removeEventListener('touchend', onTE);
            el.removeEventListener('mousedown', onMD);
            el.removeEventListener('mousemove', onMM);
            el.removeEventListener('mouseup', onMU);
            el.removeEventListener('mouseleave', onMU);
        };
    }, [totalCount]);

    // ---------- 共有 ----------
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/join/${roomId}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'もしもし防災', url: shareUrl }); return; } catch { /* */ }
        }
        try { await navigator.clipboard.writeText(shareUrl); } catch {
            const i = document.createElement('input'); i.value = shareUrl;
            document.body.appendChild(i); i.select(); document.execCommand('copy'); document.body.removeChild(i);
        }
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    // ---------- カードタップナビゲーション ----------
    const handleCardClick = (e) => {
        // 展開モード中またはオーバーレイを閉じている最中は無視
        if (expandedCard !== null || isClosingOverlay) return;
        
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardCenter = rect.width / 2;
        
        if (clickX > cardCenter) {
            // 右側タップ：次へ
            if (currentIndex < totalCount - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        } else {
            // 左側タップ：前へ
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    const displayText = (text) => {
        if (!text) return '';
        // {prevAnswer:qX} → 合意済み or 回答一致ならそのテキスト、それ以外は __
        let resolved = text.replace(/\{prevAnswer:(\w+)\}/g, (_, qId) => {
            // 1. 明示的な合意があればそれを使う
            const ag = agreements.find((a) => a.questionId === qId);
            if (ag) return ag.agreedText;
            // 2. 回答が全員一致している場合はその回答を使う
            const card = questionCards.find((c) => c.question.id === qId);
            if (card && card.allMatch) {
                const firstAnswer = card.cohabitingAnswers.find((a) => a.answerText.trim().length > 0);
                if (firstAnswer) return firstAnswer.answerText;
            }
            return '__';
        });
        resolved = resolved.replace(/\{location\}/g, '[よくいる場所]');
        resolved = resolved.replace(/\{otherText\}/g, '[その他]');
        return resolved;
    };
    const PEEK = 24;
    const CARD_GAP = 12;
    const cardWidth = slideWidth ? slideWidth - (2 * PEEK) : 0;
    const stepSize = cardWidth + CARD_GAP;
    const trackPx = PEEK - (currentIndex * stepSize) + dragOffset;

    if (totalCount === 0) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <p className="text-[#8D8D8D] text-sm">読み込み中...</p>
            </div>
        );
    }

    const currentCard = expandedCard !== null ? questionCards[expandedCard] : null;
    const displayedCard = questionCards[currentIndex];
    const indicatorColor = displayedCard?.isIndividual ? '#0EB09F' : '#137FDE';

    return (
        <div
            className="h-[100dvh] max-h-[100dvh] relative overflow-hidden overscroll-none bg-white flex flex-col"
            style={{
                opacity: hasEntered ? 1 : 0,
                transform: hasEntered ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
            }}
        >
            {/* ===== ヘッダー ===== */}
            <div
                className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0 transition-all duration-300"
                style={{ opacity: showChrome ? 1 : 0, pointerEvents: showChrome ? 'auto' : 'none' }}
            >
                <div
                    className="flex items-center gap-3 rounded-full px-3 h-9"
                    style={{ backgroundColor: agreedCount >= totalCount ? '#1E1E1E' : '#FE7833' }}
                >
                    <span className="text-[#F9F9F9] font-medium text-[16px]">合意数</span>
                    <span className="text-[#F9F9F9] font-bold text-[20px]">{agreedCount}/{totalCount}</span>
                </div>
                <button type="button" onClick={handleShare}
                    className="flex items-center gap-1 rounded-full px-3 h-9 bg-[#8D8D8D] text-[#F9F9F9] text-[16px] font-medium hover:bg-[#7a7a7a] active:scale-95 transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    {showCopied ? 'コピー済み' : '共有'}
                </button>
            </div>

            {/* ===== カルーセル ===== */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden min-h-0 transition-opacity duration-300"
                style={{ opacity: showChrome ? 1 : 0, pointerEvents: showChrome ? 'auto' : 'none', transition: chromeInstantShow ? 'none' : undefined }}
            >
                <div
                    className="h-full flex"
                    style={{
                        transform: `translate3d(${trackPx}px, 0, 0)`,
                        transition: (isDragging || suppressTrackTransition) ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                        willChange: 'transform',
                        gap: `${CARD_GAP}px`,
                        paddingBottom: '150px',
                    }}
                >
                    {questionCards.map((card, idx) => (
                        <div
                            key={card.question.id}
                            className="h-full flex-shrink-0 flex flex-col py-1"
                            style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                            onClick={handleCardClick}
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
                                    onExpand={() => openOverlay(idx)}
                                    cardRef={(el) => { overlayCardRefs.current[idx] = el; }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== 下部 ===== */}
            <div
                className="absolute left-0 right-0 px-5 pointer-events-none transition-opacity duration-300"
                style={{ 
                    bottom: '16px',
                    opacity: showChrome ? 1 : 0,
                    pointerEvents: showChrome ? 'auto' : 'none',
                    backgroundColor: 'transparent'
                }}
            >
                {/* ドットインジケーター（表示中のカードが個別＝青緑、共通＝青） */}
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
                    onClick={() => setShowSheetModal(true)}
                    className="w-full h-[53px] rounded-full font-bold text-[24px] transition-all active:scale-[0.98] disabled:cursor-not-allowed pointer-events-auto"
                    style={{
                        backgroundColor: canCreateSheet ? '#FE7833' : '#8D8D8D',
                        color: canCreateSheet ? '#F9F9F9' : '#A2A2A2',
                    }}
                >
                    防災シート作成
                </button>
                {!canCreateSheet && (
                    <p className="text-[#8D8D8D] text-[12px] text-justify mt-2 leading-[1.4]">
                        全ての項目が合意されないと防災シートを作成することはできません。
                    </p>
                )}
            </div>

            {/* ===== フルスクリーン展開オーバーレイ（body に portal で viewport 基準） ===== */}
            {typeof document !== 'undefined' && document.body && overlayState !== 'closed' && createPortal(
                <ExpandedOverlay
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

            {/* ===== 防災シートモーダル ===== */}
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

            {/* コピー通知 */}
            <div
                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-bold text-[#137FDE] transition-all duration-300"
                style={{ opacity: showCopied ? 1 : 0, pointerEvents: showCopied ? 'auto' : 'none' }}
            >
                リンクをコピーしました！
            </div>
        </div>
    );
}

// ========== 個別質問カード（人によって違う質問）==========
function IndividualCard({ card, users, displayText }) {
    const { question, cohabitingAnswers, separateAnswers } = card;
    const allAnswers = [...cohabitingAnswers, ...separateAnswers];

    return (
        <div className="flex-1 bg-[#0EB09F] rounded-[20px] flex flex-col shadow-xl overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <h3 className="font-bold text-white leading-[135%] mb-3 whitespace-pre-line" style={{ fontSize: 'clamp(18px, 5vw, 20px)' }}>
                    {displayText(question.text)}
                </h3>

                <div className="space-y-3">
                    {allAnswers.map(({ user, answerText, memoText: memo }) => (
                        <div key={user.id} className="bg-white rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                            <span className="inline-flex justify-center items-center bg-[#0EB09F] text-white rounded-full px-3 py-1 text-sm font-bold flex-shrink-0">
                                {user.name}
                            </span>
                            <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                                <p className="text-[#0EB09F] font-bold text-sm leading-snug">{user.location || user.attributes?.location || '—'}</p>
                                <p className="text-[#0EB09F] text-base leading-none my-1">↓</p>
                                <p className="text-[#0EB09F] font-bold text-base leading-snug">{answerText || '—'}</p>
                                {memo && <p className="text-[#0EB09F]/60 text-xs mt-2 leading-relaxed font-medium">{memo}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ========== カルーセル内のカード（非展開時）==========
function SummaryCard({ card, displayText, onExpand, cardRef }) {
    const { question, cohabitingAnswers, separateAnswers, agreement, isAgreed } = card;
    const badgeBg = isAgreed ? 'bg-[#1E1E1E]' : 'bg-[#FE7833]';
    const badgeText = isAgreed ? '合意済' : '✗ 未一致';

    return (
        <div
            ref={cardRef}
            className="flex-1 bg-[#137FDE] rounded-[20px] flex flex-col shadow-xl overflow-hidden min-h-0"
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
                    /* 合意済み: 「家族」タグ + 合意内容 */
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
                    /* 未合意: 個人の回答リスト */
                    <div className="space-y-3 mb-4 flex-shrink-0">
                        {cohabitingAnswers.map(({ user, answerText, memoText: memo }) => (
                            <div key={user.id} className="flex items-start gap-3">
                                <span className="inline-block bg-white text-[#137FDE] rounded-full px-2 py-0.5 text-base font-medium flex-shrink-0 border border-white">
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
                
                <p className="text-[#137FDE]/40 text-xs text-justify mt-4 leading-relaxed flex-shrink-0">
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
                    className="w-full py-3 rounded-full bg-white text-[#137FDE] text-xl font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-[0px_0px_11.5px_0px_rgba(93,93,93,0.50)]"
                >
                    話し合って修正
                </button>
            </div>
        </div>
    );
}

// ========== フルスクリーン展開オーバーレイ ==========
function ExpandedOverlay({ card, overlayState, targetRect, contentMaxWidth, roomId, displayText, onClose, onClosed, onAgreed }) {
    const [agreedText, setAgreedText] = useState('');
    const [memoText, setMemoText] = useState('');
    const [saving, setSaving] = useState(false);
    const prevCardRef = useRef(null);
    const closedFiredRef = useRef(false);

    useEffect(() => {
        if (card) {
            prevCardRef.current = card;
            setAgreedText(card.agreement?.agreedText || '');
            setMemoText('');
        }
    }, [card]);

    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        if (overlayState !== 'closed') meta.setAttribute('content', '#137FDE');
        return () => meta.setAttribute('content', '#F5F5F5');
    }, [overlayState]);

    useEffect(() => {
        if (overlayState === 'closed') return;
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.backgroundColor;
        const prevBody = body.style.backgroundColor;
        html.style.backgroundColor = '#137FDE';
        body.style.backgroundColor = '#137FDE';
        return () => {
            html.style.backgroundColor = prevHtml;
            body.style.backgroundColor = prevBody;
        };
    }, [overlayState]);

    const handleShellTransitionEnd = (e) => {
        if (e.target !== e.currentTarget) return;
        if (overlayState !== 'closing') return;
        if (closedFiredRef.current) return;
        closedFiredRef.current = true;
        onClosed();
    };
    useEffect(() => {
        if (overlayState === 'closing') closedFiredRef.current = false;
    }, [overlayState]);

    const displayCard = card || prevCardRef.current;
    if (overlayState === 'closed') return null;

    const { question, cohabitingAnswers, isAgreed, agreement } = displayCard || {};
    const badgeBg = isAgreed ? 'bg-[#1E1E1E]' : 'bg-[#FE7833]';
    const badgeText = isAgreed ? '✓ 合意済' : '不一致';

    const handleAgree = async () => {
        const isAdminBypass = (memoText || '').trim().toLowerCase() === 'admin';
        if (!isAdminBypass && !agreedText.trim()) {
            alert('合意した内容を入力してください');
            return;
        }
        setSaving(true);
        try {
            const agreementId = `${roomId}_${question.id}`;
            const agreementData = {
                id: agreementId, roomId, questionId: question.id,
                agreedText: agreedText.trim(), memoText: memoText.trim(),
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(collection(db, 'agreements'), agreementId), agreementData);
            onAgreed(agreementData);
        } catch (err) {
            console.error('合意保存エラー:', err);
            alert('保存に失敗しました。');
        } finally { setSaving(false); }
    };

    const useContentWidth = contentMaxWidth && contentMaxWidth > 0 && overlayState === 'open';
    const shellStyle =
        (overlayState === 'opening' || overlayState === 'closing') && targetRect
            ? {
                top: `${targetRect.top}px`,
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
                height: `${targetRect.height}px`,
                borderRadius: '20px',
            }
            : useContentWidth
                ? {
                    top: '0px',
                    left: `${((typeof window !== 'undefined' ? window.innerWidth : 400) - contentMaxWidth) / 2}px`,
                    width: `${contentMaxWidth}px`,
                    height: '100%',
                    borderRadius: '0px',
                }
                : {
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0px',
                };

    const isOpen = overlayState === 'open';

    return (
        <div
            className="fixed overflow-hidden bg-[#137FDE] z-40 flex flex-col"
            style={{
                ...shellStyle,
                transition:
                    'top 260ms cubic-bezier(0.25, 1, 0.5, 1), ' +
                    'left 260ms cubic-bezier(0.25, 1, 0.5, 1), ' +
                    'width 260ms cubic-bezier(0.25, 1, 0.5, 1), ' +
                    'height 260ms cubic-bezier(0.25, 1, 0.5, 1), ' +
                    'border-radius 260ms cubic-bezier(0.25, 1, 0.5, 1)',
                pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onTransitionEnd={handleShellTransitionEnd}
        >
            <div
                className="flex-1 flex flex-col min-h-0"
                style={{
                    opacity: isOpen ? 1 : 0,
                    transition: overlayState === 'closing'
                        ? 'opacity 90ms ease'
                        : 'opacity 140ms ease 80ms',
                }}
            >
                <div
                    className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 min-h-0"
                    style={{
                        paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
                        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))'
                    }}
                >
                    {/* バッジ + 閉じるボタン - レイヤー1 */}
                    <div className="flex items-center justify-between mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold ${badgeBg}`}>
                            {badgeText}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#137FDE] text-xl font-semibold hover:bg-white/90 transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 質問 - レイヤー1 */}
                    <h3 className="text-2xl font-bold text-white leading-relaxed mb-6 whitespace-pre-line">
                        {displayText(question?.text)}
                    </h3>

                    {/* 回答一覧 - レイヤー2 */}
                    <div className="space-y-4 mb-6">
                            {cohabitingAnswers?.map(({ user, answerText, memoText: memo }) => (
                                <div key={user.id} className="flex items-start justify-between">
                                    <span className="inline-block bg-white text-stone-900 rounded-full px-2.5 py-0.5 text-base font-medium border border-white flex-shrink-0">
                                        {user.name}
                                    </span>
                                    <div className="flex-1 min-w-0 ml-4">
                                        <p className="text-white text-xl font-bold">{answerText || '—'}</p>
                                        {memo && <p className="text-white text-xs mt-0.5 leading-relaxed">{memo}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tips カード - レイヤー2 */}
                        <div>
                        {(question?.id === 'q5' || question?.id === 'q6') ? (
                            /* === 171ダイヤル Tips (Q5/Q6) === */
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">災害用伝言ダイヤル(171)とは</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify mb-4">
                                    大規模災害が発生し、被災地への電話が繋がりにくい状態になった際に提供される「声の録音・再生サービス」です。
                                </p>
                                <div className="flex flex-col gap-4">
                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-[#137FDE] rounded-full text-white text-sm font-bold">STEP1</span>
                                    <p className="text-[#137FDE] text-xl font-bold">「171」に電話をかける</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">音声ガイダンスが流れます</p>

                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-[#137FDE] rounded-full text-white text-sm font-bold">STEP2</span>
                                    <p className="text-[#137FDE] text-xl font-bold">「録音」か「再生」を選ぶ</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">録音したい場合：「1」を押す<br />聞きたい場合：「2」を押す</p>

                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-[#137FDE] rounded-full text-white text-sm font-bold">STEP3</span>
                                    <p className="text-[#137FDE] text-xl font-bold">電話番号を入力する</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">伝言を伝えたい方の電話番号を入力し、メッセージを録音・確認します。</p>
                                </div>
                                <img src={tips3Svg} alt="スマートフォン" className="w-full h-auto mt-4 rounded-lg" />
                            </div>
                        ) : question?.id === 'q7' ? (
                            /* === 置き手紙ルール Tips (Q7) === */
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">書く内容まで決めておこう！</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    置き手紙を貼る場所だけでなく、何を書くかも重要です。『〇〇小学校へ行く。15時出発』など、時刻と行き先を書くルールを今ここで決めてしまいましょう。
                                </p>
                                <img src={tips4Svg} alt="置き手紙を貼るドア" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : question?.id === 'q8' ? (
                            /* === 持ち出しチェック Tips (Q8) === */
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-4">持ち出しの確実性チェック！</h4>
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-[#137FDE] rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                                            <span className="text-[#137FDE] text-base font-bold">暗闇でも迷わず手に取れるか</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">手探りでもすぐに見つけられる場所か、また、取り出すまでに障害物がないかを確認しましょう。</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-[#137FDE] rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                                            <span className="text-[#137FDE] text-base font-bold">「一人で持ち出せる重さ」か</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">各自の体力に合わせた重さに分け、全員が『自分の袋』を把握しておくことが重要です。</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-[#137FDE] rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                                            <span className="text-[#137FDE] text-base font-bold">玄関までの動線を確認</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">避難の最終ラインである玄関扉のすぐ横など、逃げながら無理なく掌める場所が理想的です。</p>
                                    </div>
                                </div>
                                <img src={tips5Svg} alt="非常持ち出し袋" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : question?.id === 'q9' ? (
                            /* === 必需品 Tips (Q9) === */
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">家族に届けてもらうための共通認識を</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    家にいる家族に、絶対に持ってきもらいたい必需品(持病の薬、予備のめがね、補聴器など)を具体的に伝えておきましょう。
                                </p>
                                <img src={tips6Svg} alt="絶対に持っていく必需品" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : ['q10', 'q11', 'q12', 'q13', 'q14', 'q_pet', 'q_child', 'q_elder', 'q_disability', 'q_other'].includes(question?.id) ? (
                            /* === 第2担当者 Tips (Q10〜Q14, 属性別) === */
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">「もし担当者が不在なら？」という二段構えを</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    平日の昼間などメインの担当者が不在の場合の「第2担当者」もセットで話し合いましょう。
                                </p>
                                <img src={tips7Svg} alt="第2担当者の確認" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : (
                            /* === 避難所の種類 Tips (その他) === */
                            <div className="bg-[#F9F9F9] rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-1">避難所の種類</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-4 text-justify mb-4">
                                    指定緊急避難場所と指定避難所の違いを理解して場所を選びましょう。
                                </p>

                                <div className="mb-4">
                                    <div className="flex items-center gap-4 mb-1">
                                        <span className="font-bold text-stone-900 text-base leading-6">指定緊急避難場所とは</span>
                                        <span className="inline-flex items-center justify-center px-3 h-4 bg-stone-900 rounded-full text-white text-xs font-bold">対象地を探す</span>
                                    </div>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">
                                        災害の危険から命を守るために緊急的に避難する場所
                                    </p>
                                    <img src={tips1Svg} alt="指定緊急避難場所" className="w-full h-auto mt-2 mb-4 rounded-lg" />
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-center gap-4 mb-1">
                                        <span className="font-bold text-stone-900 text-base leading-6">指定避難所とは</span>
                                        <span className="inline-flex items-center justify-center px-3 h-4 bg-stone-900 rounded-full text-white text-xs font-bold">対象地を探す</span>
                                    </div>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">
                                        避難してきた被災者が一定期間生活するための施設
                                    </p>
                                    <img src={tips2Svg} alt="指定避難所" className="w-full h-auto mt-2 mb-4 rounded-lg" />
                                </div>
                            </div>
                        )}
                        </div>

                        {/* 合意フォーム - レイヤー3 */}
                        <div className="mb-4">
                            <label className="text-white text-xl font-bold mb-3 block">合意した避難場所</label>
                            <input
                                type="text"
                                value={agreedText}
                                onChange={(e) => setAgreedText(e.target.value)}
                                placeholder="南小学校"
                                className="w-full px-4 py-2.5 rounded-lg bg-[#F9F9F9] text-stone-900 placeholder-stone-300 text-base font-medium focus:outline-none transition-all"
                            />
                        </div>

                        <div className="bg-[#123C4B] rounded-lg px-3 py-2 mb-6">
                            <textarea
                                value={memoText}
                                onChange={(e) => setMemoText(e.target.value)}
                                placeholder={"\u30E1\u30E2\u7528\u6B04\n\u4F8B\uFF09\u6D25\u6CE2\u304C\u6765\u305F\u3089\u3001\u907F\u96E3\u6240\u306B\u5411\u304B\u308F\u305A\u8FD1\u304F\u306E\u30DE\u30F3\u30B7\u30E7\u30F3\u306B\u9003\u3052\u8FBC\u3080"}
                                rows={3}
                                className="w-full bg-transparent text-[#137FDE] text-base font-medium placeholder-[#137FDE]/50 focus:outline-none resize-none leading-6"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAgree}
                            disabled={saving}
                            className="w-full py-3 rounded-full bg-[#FE7833] text-white font-bold text-2xl shadow-lg hover:bg-[#e56a2a] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? '保存中...' : '全員で合意した'}
                        </button>
                </div>
            </div>
        </div>
    );
}

// ========== 防災シート確認モーダル ==========
function SheetModal({ onClose, questionCards, agreements, answers, users, cohabitingUsers, separateUsers }) {
    const cardRefs = useRef([]);
    const previewRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [cardScale, setCardScale] = useState(1);

    // プレビュー領域の幅に合わせてカードを縮小
    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const CARD_WIDTH = 800;
        const calcScale = () => {
            const containerWidth = el.offsetWidth - 32; // px-4 padding
            setCardScale(Math.min(containerWidth / CARD_WIDTH, 1));
        };
        calcScale();
        const ro = new ResizeObserver(calcScale);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // agreements / answers からデータを取得するヘルパー
    const getAgreedText = (qId) => {
        const ag = agreements.find((a) => a.questionId === qId);
        if (ag) return ag.agreedText;
        const card = questionCards.find((c) => c.question.id === qId);
        if (card && card.allMatch) {
            const first = card.cohabitingAnswers.find((a) => a.answerText.trim().length > 0);
            if (first) return first.answerText;
        }
        return '';
    };

    const getAgreedMemo = (qId) => {
        const ag = agreements.find((a) => a.questionId === qId);
        const raw = ag?.memoText || '';
        // 管理者用抜け道の "admin" はシートには表示しない
        if (raw.trim().toLowerCase() === 'admin') return '';
        return raw;
    };

    const getIndividualAnswers = (qId) => {
        return users.map((user) => {
            const ans = answers.find((a) => a.questionId === qId && a.userId === user.id);
            return { user, answerText: ans?.answerText || '', memoText: ans?.memoText || '' };
        }).filter((a) => a.answerText.trim().length > 0);
    };

    const contactMethod = getAgreedText('q5');
    const contactMethodMemo = getAgreedMemo('q5');
    const contactBackup = getAgreedText('q6');
    const contactBackupMemo = getAgreedMemo('q6');
    const messagePlace = getAgreedText('q7');
    const messagePlaceMemo = getAgreedMemo('q7');
    const priorityItems = getAgreedText('q9');
    const priorityItemsMemo = getAgreedMemo('q9');
    const emergencyBagPlace = getAgreedText('q8');
    const emergencyBagMemo = getAgreedMemo('q8');

    const homeEvac1 = getAgreedText('q1');
    const homeEvac1Memo = getAgreedMemo('q1');
    const homeEvac2 = getAgreedText('q2');
    const homeEvac2Memo = getAgreedMemo('q2');

    const outsideEvacAnswers = getIndividualAnswers('q3');
    const outsideEvacBackupAnswers = getIndividualAnswers('q4');

    const petAnswer = getAgreedText('q_pet');
    const petMemo = getAgreedMemo('q_pet');
    const childAnswer = getAgreedText('q_child');
    const childMemo = getAgreedMemo('q_child');
    const elderAnswer = getAgreedText('q_elder');
    const elderMemo = getAgreedMemo('q_elder');
    const disabilityAnswer = getAgreedText('q_disability');
    const disabilityMemo = getAgreedMemo('q_disability');
    const otherAnswer = getAgreedText('q_other');
    const otherMemo = getAgreedMemo('q_other');

    const hasPetQ = questionCards.some((c) => c.question.id === 'q_pet');
    const hasChildQ = questionCards.some((c) => c.question.id === 'q_child');
    const hasElderQ = questionCards.some((c) => c.question.id === 'q_elder');
    const hasDisabilityQ = questionCards.some((c) => c.question.id === 'q_disability');
    const hasOtherQ = questionCards.some((c) => c.question.id === 'q_other');
    const specialCards = [
        hasPetQ && { icon: PawPrint, label: 'ペットの対応', answer: petAnswer, memo: petMemo },
        hasChildQ && { icon: Baby, label: '子供の対応', answer: childAnswer, memo: childMemo },
        hasElderQ && { icon: Heart, label: '高齢者の対応', answer: elderAnswer, memo: elderMemo },
        hasDisabilityQ && { icon: Heart, label: '障害者の対応', answer: disabilityAnswer, memo: disabilityMemo },
        hasOtherQ && { icon: ClipboardList, label: 'その他の対応', answer: otherAnswer, memo: otherMemo },
    ].filter(Boolean);

    const handleSave = async () => {
        if (saving) return;

        // 有効なカードのrefとファイル名のペアを作成
        const cardsToExport = [];
        if (cardRefs.current[0]) {
            cardsToExport.push({ el: cardRefs.current[0], name: 'もしもし防災カード_同居用.png' });
        }
        separateUsers.forEach((user, index) => {
            if (cardRefs.current[index + 1]) {
                cardsToExport.push({ el: cardRefs.current[index + 1], name: `もしもし防災カード_別世帯版_${user.name}.png` });
            }
        });

        if (cardsToExport.length === 0) return;

        setSaving(true);
        try {
            for (let i = 0; i < cardsToExport.length; i++) {
                const { el, name } = cardsToExport[i];
                const dataUrl = await toPng(el, {
                    width: 800,
                    height: el.scrollHeight,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                });
                const link = document.createElement('a');
                link.download = name;
                link.href = dataUrl;
                link.click();

                // 複数連続ダウンロードを確実にするため少し待機
                if (i < cardsToExport.length - 1) {
                    await new Promise(res => setTimeout(res, 500));
                }
            }
        } catch (err) {
            console.error('画像保存エラー:', err);
            alert('画像の保存に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = async () => {
        if (saving) return;

        const validRefs = [];
        if (cardRefs.current[0]) validRefs.push(cardRefs.current[0]);
        separateUsers.forEach((_, index) => {
            if (cardRefs.current[index + 1]) validRefs.push(cardRefs.current[index + 1]);
        });

        if (validRefs.length === 0) return;

        setSaving(true);
        try {
            const dataUrls = [];
            for (const el of validRefs) {
                const dataUrl = await toPng(el, {
                    width: 800,
                    height: el.scrollHeight,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                });
                dataUrls.push(dataUrl);
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) { alert('ポップアップがブロックされました。'); return; }

            const imgElements = dataUrls.map(url =>
                `<div class="page"><img src="${url}" /></div>`
            ).join('');

            printWindow.document.write(`
            <!DOCTYPE html>
            <html><head>
                <title>もしもし防災カード</title>
                <style>
                    @page { size: A4 landscape; margin: 10mm; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { background: white; }
                    .page { 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        width: 100%; 
                        height: 100vh;
                        page-break-after: always;
                    }
                    .page:last-child { page-break-after: auto; }
                    img { width: 100%; max-width: 100%; height: auto; display: block; }
                </style>
            </head><body>
                    ${imgElements}
                    <script>
                        // 画像の読み込み完了を待たずに印刷ダイアログが開くとうまくいかない場合があるため
                        window.onload = () => {
                            setTimeout(() => window.print(), 500);
                        };
                        window.onafterprint=()=>window.close();
                    <\/script>
                </body></html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error('印刷準備エラー:', err);
            alert('印刷準備に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    const cardHeight = 565;

    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] bg-white flex flex-col sheet-modal">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0 no-print">
                <span className="text-gray-400 text-xs">家族の回答まとめ</span>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-gray-800 hover:text-gray-500 transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* スクロール可能なプレビュー領域 */}
            <div ref={previewRef} className="flex-1 overflow-auto px-4 pb-4">
                {/* カード群ラッパー（キャプチャ対象） */}
                <div
                    style={{ width: '800px', transformOrigin: 'top left', transform: `scale(${cardScale})` }}
                    className="flex flex-col gap-8"
                >
                    {/* ===== 同居家族用カード ===== */}
                    <div
                        ref={(el) => (cardRefs.current[0] = el)}
                        className="bg-white rounded-lg overflow-hidden border border-gray-200"
                        style={{ width: '800px', minHeight: '565px', fontFamily: "'Zen Maru Gothic', sans-serif" }}
                    >
                        {/* タイトル行 */}
                        <div className="flex items-center justify-center gap-4 pt-6 pb-3 px-8">
                            <div className="flex-1 h-[1px] bg-black" />
                            <h2 className="text-sky-600 text-xl font-bold tracking-wide">もしもし防災カード</h2>
                            <div className="flex-1 h-[1px] bg-black" />
                        </div>

                        <div className="px-8 pb-6">
                            {/* --- 上部4カラム --- */}
                            <div className="grid grid-cols-4 gap-0 mb-4">
                                {/* 緊急時の連絡手段 */}
                                <div className="border-r border-gray-300 pr-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">緊急時の連絡手段</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline mb-0.5">1.{contactMethod || '—'}</p>
                                    {contactBackup && <p className="font-bold text-black text-xs underline">2.{contactBackup}</p>}
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {contactMethodMemo || contactBackupMemo || '公衆電話の場所を事前に確認しておく。'}
                                    </p>
                                </div>

                                {/* 伝言ルール */}
                                <div className="border-r border-gray-300 px-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">伝言ルール</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline">{messagePlace || '—'}</p>
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {messagePlaceMemo || '家族全員が必ず見る場所を決めておく。'}
                                    </p>
                                </div>

                                {/* 優先してもっていく物 */}
                                <div className="border-r border-gray-300 px-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">優先してもっていく物</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline">{priorityItems || '—'}</p>
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {priorityItemsMemo || '貴重品、水、薬など最低限をリストアップしておく。'}
                                    </p>
                                </div>

                                {/* 避難用具の場所 */}
                                <div className="pl-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">避難用具の場所</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline">{emergencyBagPlace || '—'}</p>
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {emergencyBagMemo || '家族全員が場所を知っていることが大切。'}
                                    </p>
                                </div>
                            </div>

                            {/* --- 避難場所エリア（青背景） --- */}
                            <div className="bg-sky-600 rounded-xl p-4 mb-4">
                                <div className="flex gap-4 mb-3">
                                    <span className="text-white text-xs font-bold text-center shrink-0">避難場所（在宅時）</span>
                                    <span className="text-white text-xs font-bold text-center flex-1">避難場所（仕事・学校に行っている時）</span>
                                </div>
                                <div className="flex gap-4">
                                    {/* 在宅時 */}
                                    <div className="bg-white rounded-[5px] p-3 text-center flex-shrink-0" style={{ minWidth: '140px', maxWidth: '250px' }}>
                                        <div className="bg-sky-600 rounded-[3px] px-2 py-1 inline-block mb-2">
                                            <span className="text-white text-xs font-bold">家族全員</span>
                                        </div>
                                        <p className="font-bold text-black text-xs underline mb-1">{homeEvac1 || '—'}</p>
                                        <p className="text-neutral-700 text-[8px] leading-relaxed">{homeEvac1Memo || ''}</p>
                                        {homeEvac2 && (
                                            <div className="mt-2 pt-1 border-t border-gray-200">
                                                <p className="text-neutral-500 text-[8px]">第二候補: {homeEvac2}</p>
                                                {homeEvac2Memo && <p className="text-neutral-700 text-[8px]">{homeEvac2Memo}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* 外出先（個人別） */}
                                    <div className="bg-white rounded-[5px] p-3 flex-1">
                                        <div className="flex gap-3 flex-wrap justify-center">
                                            {outsideEvacAnswers.length > 0 ? outsideEvacAnswers.map(({ user, answerText, memoText }) => {
                                                const backup = outsideEvacBackupAnswers.find((a) => a.user.id === user.id);
                                                return (
                                                    <div key={user.id} className="min-w-[100px] text-center">
                                                        <div className="bg-sky-600 rounded-[3px] px-2 py-1 inline-block mb-2">
                                                            <span className="text-white text-xs font-bold">{user.name}</span>
                                                        </div>
                                                        <p className="font-bold text-black text-xs underline mb-1">{answerText || '—'}</p>
                                                        <p className="text-neutral-700 text-[8px] leading-relaxed">{memoText || ''}</p>
                                                        {backup && backup.answerText && (
                                                            <p className="text-neutral-500 text-[8px] mt-1">第二: {backup.answerText}</p>
                                                        )}
                                                    </div>
                                                );
                                            }) : (
                                                <p className="text-neutral-400 text-sm">—</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- 下部：属性別 + メモ欄 --- */}
                            <div className="grid grid-cols-[auto_1fr] gap-3">
                                {specialCards.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {specialCards.map((sc, idx) => (
                                            <div key={idx} className="text-center">
                                                <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 inline-block">
                                                    <span className="text-white text-xs font-bold">{sc.label}</span>
                                                </div>
                                                <p className="font-bold text-black text-xs underline">{sc.answer || '—'}</p>
                                                {sc.memo && <p className="text-neutral-700 text-[8px] mt-1 leading-relaxed">{sc.memo}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="border border-black rounded-md p-2">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1 mb-1 inline-block">
                                        <span className="text-white text-xs font-bold">メモ欄</span>
                                    </div>
                                    <div className="h-16" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== 別居家族用カード（separateUsers 分） ===== */}
                    {separateUsers.map((user, index) => {
                        const getUserAnswer = (qId) => {
                            const ans = answers.find((a) => a.questionId === qId && a.userId === user.id);
                            return ans?.answerText || '';
                        };
                        const getUserMemo = (qId) => {
                            const ans = answers.find((a) => a.questionId === qId && a.userId === user.id);
                            return ans?.memoText || '';
                        };
                        const sepHomeEvac = getUserAnswer('q1');
                        const sepHomeMemo = getUserMemo('q1');
                        const sepOutEvac = getUserAnswer('q3');
                        const sepOutMemo = getUserMemo('q3');

                        return (
                            <div
                                key={user.id}
                                ref={(el) => (cardRefs.current[index + 1] = el)}
                                className="bg-white rounded-lg overflow-hidden border border-gray-200"
                                style={{ width: '800px', minHeight: '400px', fontFamily: "'Zen Maru Gothic', sans-serif" }}
                            >
                                {/* タイトル行 */}
                                <div className="flex items-center justify-center gap-4 pt-6 pb-3 px-8">
                                    <div className="flex-1 h-[1px] bg-black" />
                                    <h2 className="text-sky-600 text-xl font-bold tracking-wide">もしもし防災カード</h2>
                                    <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">別世帯版</span>
                                    <div className="flex-1 h-[1px] bg-black" />
                                </div>

                                <div className="px-8 pb-6">
                                    {/* 上部3カラム */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {/* 名前 */}
                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">名前</span>
                                            </div>
                                            <p className="font-bold text-black text-sm">{user.name}</p>
                                        </div>

                                        {/* 緊急時の連絡手段 */}
                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">緊急時の連絡手段</span>
                                            </div>
                                            <p className="font-bold text-black text-xs underline mb-0.5">1.{contactMethod || '—'}</p>
                                            {contactBackup && <p className="font-bold text-black text-xs underline">2.{contactBackup}</p>}
                                        </div>

                                        {/* 伝言ルール */}
                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">伝言ルール</span>
                                            </div>
                                            <p className="font-bold text-black text-xs underline">{messagePlace || '—'}</p>
                                        </div>
                                    </div>

                                    {/* 避難場所エリア（青背景） */}
                                    <div className="bg-sky-600 rounded-[5px] p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* 在宅時 */}
                                            <div className="text-center">
                                                <span className="text-white text-xs font-bold mb-2 block text-center">避難場所（在宅時）</span>
                                                <div className="bg-white rounded p-3 text-center">
                                                    <p className="font-bold text-black text-xs underline mb-1">{sepHomeEvac || '—'}</p>
                                                    {sepHomeMemo && <p className="text-neutral-700 text-[8px] leading-relaxed">{sepHomeMemo}</p>}
                                                </div>
                                            </div>
                                            {/* 外出先 */}
                                            <div className="text-center">
                                                <span className="text-white text-xs font-bold mb-2 block text-center">避難場所（仕事・学校に行っている時）</span>
                                                <div className="bg-white rounded p-3 text-center">
                                                    <p className="font-bold text-black text-xs underline mb-1">{sepOutEvac || '—'}</p>
                                                    {sepOutMemo && <p className="text-neutral-700 text-[8px] leading-relaxed">{sepOutMemo}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 下部ボタン */}
            <div className="flex-shrink-0 px-6 pb-8 pt-4 space-y-3 no-print">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 rounded-full bg-[#137FDE] text-white font-bold text-lg shadow-lg hover:bg-[#0e6bbd] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    {saving ? '保存中...' : '写真に保存'}
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-4 rounded-full bg-[#137FDE] text-white font-bold text-lg shadow-lg hover:bg-[#0e6bbd] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Printer className="w-5 h-5" />
                    印刷
                </button>
            </div>
        </div>
    );
}
