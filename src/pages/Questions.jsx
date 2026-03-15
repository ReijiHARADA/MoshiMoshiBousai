import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSwipeCarousel } from '../hooks/useSwipeCarousel';
import { shareRoom } from '../lib/share';
import { QUESTIONS } from '../data/questions';
import familyIllustration from '../assets/family.svg';

export default function Questions() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('currentUser')) || {};
        } catch {
            return {};
        }
    }, []);

    // ルームの属性を取得（ルーム作成者のみが設定、全ユーザー共有）
    const [roomAttributes, setRoomAttributes] = useState(null);
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const roomDoc = await getDoc(doc(db, 'rooms', roomId));
                if (roomDoc.exists()) {
                    setRoomAttributes(roomDoc.data().attributes || {});
                }
            } catch (err) {
                console.error('Room fetch error:', err);
            }
        };
        fetchRoom();
    }, [roomId]);

    const filteredQuestions = useMemo(() => {
        // ルーム属性をベースに、ユーザーの属性もマージ
        const attrs = { ...(roomAttributes || {}), ...(currentUser.attributes || {}) };
        return QUESTIONS.filter((q) => {
            if (q.targetAttribute === 'all') return true;
            // otherText は文字列なので truthy チェック、他は boolean
            const val = attrs[q.targetAttribute];
            return q.targetAttribute === 'otherText' ? !!val && val.trim().length > 0 : val === true;
        });
    }, [currentUser, roomAttributes]);

    const [answers, setAnswers] = useState({});
    const [memos, setMemos] = useState({});
    const [saving, setSaving] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [titleMinHeight, setTitleMinHeight] = useState(null);
    const [isExiting, setIsExiting] = useState(false);
    const rulerRef = useRef(null);

    const totalQuestions = filteredQuestions.length;
    const totalSlides = totalQuestions + 1; // +1 for completion slide

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

    // 全問回答済みか、未回答の先頭インデックス（開発者用: 初めの質問のメモに「admin」でスキップ）
    const { allAnswered, firstUnansweredIndex } = useMemo(() => {
        const firstQuestion = filteredQuestions[0];
        const adminSkip = firstQuestion && (memos[firstQuestion.id] || '').trim().toLowerCase() === 'admin';

        let first = -1;
        const all = adminSkip || filteredQuestions.every((q, i) => {
            const hasAnswer = (answers[q.id] || '').trim().length > 0;
            if (!hasAnswer && first < 0) first = i;
            return hasAnswer;
        });
        return { allAnswered: all, firstUnansweredIndex: first >= 0 ? first : 0 };
    }, [filteredQuestions, answers, memos]);

    const resolveQuestionText = (text) => {
        if (!text) return '';
        let resolved = text.replace(/\{prevAnswer:(\w+)\}/g, (_, qId) => {
            return answers[qId] || '___';
        });
        resolved = resolved.replace(/\{location\}/g, currentUser.location || '___');
        resolved = resolved.replace(/\{otherText\}/g, currentUser.attributes?.otherText || '___');
        return resolved;
    };

    // ---------- タイトル高さの最大値計測（入力位置を揃えるため） ----------
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
    }, [filteredQuestions, slideWidth, cardWidth, answers]);

    // ---------- カードタップナビゲーション ----------
    const handleCardClick = (e) => {
        // 入力フィールドにフォーカスがある場合は無視
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // 完了スライドの場合は無視（ボタンで対応）
        if (currentIndex >= totalQuestions) return;
        
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

    // ---------- 完了カードタップナビゲーション ----------
    const goToFirstUnanswered = () => setCurrentIndex(firstUnansweredIndex);

    const handleCompletionCardClick = (e) => {
        // ボタンクリックの場合は無視
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardCenter = rect.width / 2;
        
        if (clickX > cardCenter) {
            if (allAnswered) {
                handleSaveAndNavigate();
            } else {
                goToFirstUnanswered();
            }
        } else {
            goPrev();
        }
    };

    const handleAnswerChange = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));
    const handleMemoChange = (qId, val) => setMemos((p) => ({ ...p, [qId]: val }));

    // ---------- 共有 ----------
    const handleShare = async () => {
        const result = await shareRoom(roomId);
        if (result.copied) {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    // ---------- 保存＆遷移 ----------
    const handleSaveAndNavigate = async () => {
        setSaving(true);
        try {
            const userId = currentUser.id;
            await Promise.all(filteredQuestions.map((q) => {
                const aid = `${roomId}_${userId}_${q.id}`;
                return setDoc(doc(collection(db, 'answers'), aid), {
                    id: aid, roomId, userId, questionId: q.id,
                    answerText: answers[q.id] || '', memoText: memos[q.id] || '',
                });
            }));
            setIsExiting(true);
            setTimeout(() => {
                navigate(`/room/${roomId}/summary`, { state: { fromQuestions: true } });
            }, 200);
        } catch (err) {
            console.error('回答保存エラー:', err);
            alert('回答の保存に失敗しました。');
        } finally { setSaving(false); }
    };

    // ---------- 描画用の値 ----------
    const isOnCompletion = currentIndex >= totalQuestions;
    const progress = isOnCompletion ? 100 : ((currentIndex + 1) / totalQuestions) * 100;
    const dispIdx = isOnCompletion ? String(totalQuestions).padStart(2, '0') : String(currentIndex + 1).padStart(2, '0');
    const dispTot = String(totalQuestions).padStart(2, '0');
    const currentQuestion = !isOnCompletion ? filteredQuestions[currentIndex] : null;
    const isTealCard = currentQuestion && (currentQuestion.id === 'q3' || currentQuestion.id === 'q4');
    const indicatorColor = isTealCard ? '#0EB09F' : '#137FDE';

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
            {/* 物差し: 全質問タイトル高さを計測（非表示） */}
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
                            {resolveQuestionText(question.text || '')}
                        </div>
                    ))}
                </div>
            )}
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
                <div />
                <button type="button" onClick={handleShare}
                    className="flex items-center gap-1 rounded-full px-3 h-9 text-[16px] font-medium active:scale-95 transition-all bg-disabled text-white hover:bg-disabled-hover">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    {showCopied ? 'コピー済み' : '共有'}
                </button>
            </div>

            {/* ===== カルーセル ===== */}
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
                    {/* 質問カード群 */}
                    {filteredQuestions.map((question, index) => {
                        const qText = resolveQuestionText(question.text || '質問文が設定されていません');
                        return (
                            <div key={question.id}
                                className="h-full flex-shrink-0 flex flex-col py-1"
                                style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                                onClick={handleCardClick}>
                                <div className={`flex-1 rounded-[20px] px-5 py-4 flex flex-col shadow-xl overflow-hidden min-h-0 ${question.id === 'q3' || question.id === 'q4' ? 'bg-[#0EB09F]' : 'bg-[#137FDE]'}`}>
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
                                        {qText}
                                    </h2>
                                    <input
                                        type="text"
                                        value={answers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder={question.placeholder}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#F9F9F9] text-[#484848] placeholder-[#CDCDCD] text-[16px] font-medium focus:outline-none transition-all mb-3"
                                    />
                                    <div className={`flex-1 rounded-xl px-4 py-2 flex flex-col min-h-[48px] ${question.id === 'q3' || question.id === 'q4' ? 'bg-[#1F685D]' : 'bg-[#123C4B]'}`}>
                                        <p className={`text-[10px] mb-0.5 ${question.id === 'q3' || question.id === 'q4' ? 'text-[#0EB09F]/50' : 'text-[#137FDE]/50'}`}>メモ用欄</p>
                                        <textarea
                                            value={memos[question.id] || ''}
                                            onChange={(e) => handleMemoChange(question.id, e.target.value)}
                                            placeholder={question.memo}
                                            rows={2}
                                            className={`w-full flex-1 bg-transparent text-xs focus:outline-none resize-none ${question.id === 'q3' || question.id === 'q4' ? 'text-[#0EB09F] placeholder-[#0EB09F]/30' : 'text-[#137FDE] placeholder-[#137FDE]/30'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* 完了スライド（全問回答済み＝オレンジ、未回答あり＝グレー） */}
                    <div className="h-full flex-shrink-0 flex flex-col py-1"
                        style={{ width: cardWidth || 'calc(100vw - 48px)' }}
                        onClick={handleCompletionCardClick}>
                        {allAnswered ? (
                            <div className="flex-1 rounded-[20px] px-5 py-4 flex flex-col shadow-xl overflow-hidden bg-[#FE7833]">
                                <div className="mb-3">
                                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white/20 rounded-full text-white text-sm font-bold">
                                        {dispTot}/{dispTot}
                                    </span>
                                </div>
                                <h1 className="font-bold text-white leading-[135%] mb-3" style={{ fontSize: 'clamp(29px, 8vw, 36px)' }}>
                                    お疲れ様でした！
                                    <br />
                                    全{totalQuestions}問の回答が完了しました。
                                </h1>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">
                                    あなたが考えた「もしも」の備えを、家族の回答と突き合わせてみましょう。意外なズレが見つかるかもしれません。
                                </p>
                                <div className="flex justify-center items-center flex-1 px-[15px] mb-4">
                                    <img src={familyIllustration} alt="完了" className="w-full object-contain" />
                                </div>
                                <div className="px-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveAndNavigate}
                                        disabled={saving}
                                        className="w-full h-[50px] rounded-full font-bold text-[18px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-white text-[#FE7833] hover:opacity-90"
                                    >
                                        {saving ? '保存中...' : '家族の回答と比較する'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 rounded-[20px] px-5 py-4 flex flex-col shadow-xl overflow-hidden bg-[#8D8D8D]">
                                <div className="mb-3">
                                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white/20 rounded-full text-white text-sm font-bold">
                                        {dispTot}/{dispTot}
                                    </span>
                                </div>
                                <h1 className="font-bold text-white leading-[135%] mb-3" style={{ fontSize: 'clamp(29px, 8vw, 36px)' }}>
                                    まだ未回答の
                                    <br />
                                    質問があります
                                </h1>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">
                                    すべての質問に答えると、家族の回答と比較できます。未回答の質問から順に進めましょう。
                                </p>
                                <div className="flex-1 min-h-[80px]" />
                                <div className="px-4">
                                    <button
                                        type="button"
                                        onClick={goToFirstUnanswered}
                                        className="w-full h-[50px] rounded-full font-bold text-[18px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-white text-[#5a5a5a] hover:opacity-90"
                                    >
                                        未回答の質問に戻る
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ドットインジケーター（質問3・4表示時は青緑 #0EB09F） */}
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

            {/* コピー通知 */}
            {showCopied && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-bold text-[#137FDE] animate-[fadeInUp_0.2s_ease-out]">
                    リンクをコピーしました！
                </div>
            )}
        </div>
    );
}
