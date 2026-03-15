import { useState, useRef, useEffect } from 'react';
import { saveAgreement } from '../../../lib/agreements';
import tips1Svg from '../../../assets/tips1.svg';
import tips2Svg from '../../../assets/tips2.svg';
import tips3Svg from '../../../assets/tips3.svg';
import tips4Svg from '../../../assets/tips4.svg';
import tips5Svg from '../../../assets/tips5.svg';
import tips6Svg from '../../../assets/tips6.svg';
import tips7Svg from '../../../assets/tips7.svg';

/**
 * フルスクリーン展開オーバーレイ。合意フォーム・Tips・開閉アニメーションを担当。
 */
export function AgreementOverlay({
    card,
    overlayState,
    targetRect,
    contentMaxWidth,
    roomId,
    displayText,
    onClose,
    onClosed,
    onAgreed,
}) {
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
        if (overlayState !== 'closed') meta.setAttribute('content', 'var(--color-primary)');
        return () => meta.setAttribute('content', '#F5F5F5');
    }, [overlayState]);

    useEffect(() => {
        if (overlayState === 'closed') return;
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.backgroundColor;
        const prevBody = body.style.backgroundColor;
        html.style.backgroundColor = 'var(--color-primary)';
        body.style.backgroundColor = 'var(--color-primary)';
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
    const badgeBg = isAgreed ? 'bg-dark' : 'bg-accent';
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
                id: agreementId,
                roomId,
                questionId: question.id,
                agreedText: agreedText.trim(),
                memoText: memoText.trim(),
                createdAt: new Date().toISOString(),
            };
            await saveAgreement(agreementData);
            onAgreed(agreementData);
        } catch (err) {
            console.error('合意保存エラー:', err);
            alert('保存に失敗しました。');
        } finally {
            setSaving(false);
        }
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
            className="fixed overflow-hidden bg-primary z-40 flex flex-col"
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
                    transition:
                        overlayState === 'closing'
                            ? 'opacity 90ms ease'
                            : 'opacity 140ms ease 80ms',
                }}
            >
                <div
                    className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 min-h-0"
                    style={{
                        paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
                        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
                    }}
                >
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
                            className="w-9 h-9 flex items-center justify-center rounded-pill bg-white text-primary text-xl font-semibold hover:bg-white/90 transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-white leading-relaxed mb-6 whitespace-pre-line">
                        {displayText(question?.text)}
                    </h3>

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

                    <div>
                        {(question?.id === 'q5' || question?.id === 'q6') ? (
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">災害用伝言ダイヤル(171)とは</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify mb-4">
                                    大規模災害が発生し、被災地への電話が繋がりにくい状態になった際に提供される「声の録音・再生サービス」です。
                                </p>
                                <div className="flex flex-col gap-4">
                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-primary rounded-pill text-white text-sm font-bold">STEP1</span>
                                    <p className="text-primary text-xl font-bold">「171」に電話をかける</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">音声ガイダンスが流れます</p>

                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-primary rounded-pill text-white text-sm font-bold">STEP2</span>
                                    <p className="text-primary text-xl font-bold">「録音」か「再生」を選ぶ</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">録音したい場合：「1」を押す<br />聞きたい場合：「2」を押す</p>

                                    <span className="inline-flex items-center justify-center w-14 h-6 bg-primary rounded-pill text-white text-sm font-bold">STEP3</span>
                                    <p className="text-primary text-xl font-bold">電話番号を入力する</p>
                                    <p className="text-neutral-400 text-xs font-medium leading-4 text-justify">伝言を伝えたい方の電話番号を入力し、メッセージを録音・確認します。</p>
                                </div>
                                <img src={tips3Svg} alt="スマートフォン" className="w-full h-auto mt-4 rounded-lg" />
                            </div>
                        ) : question?.id === 'q7' ? (
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">書く内容まで決めておこう！</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    置き手紙を貼る場所だけでなく、何を書くかも重要です。『〇〇小学校へ行く。15時出発』など、時刻と行き先を書くルールを今ここで決めてしまいましょう。
                                </p>
                                <img src={tips4Svg} alt="置き手紙を貼るドア" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : question?.id === 'q8' ? (
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-4">持ち出しの確実性チェック！</h4>
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-primary rounded-pill flex items-center justify-center text-white text-xs font-bold">1</span>
                                            <span className="text-primary text-base font-bold">暗闇でも迷わず手に取れるか</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">手探りでもすぐに見つけられる場所か、また、取り出すまでに障害物がないかを確認しましょう。</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-primary rounded-pill flex items-center justify-center text-white text-xs font-bold">2</span>
                                            <span className="text-primary text-base font-bold">「一人で持ち出せる重さ」か</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">各自の体力に合わせた重さに分け、全員が『自分の袋』を把握しておくことが重要です。</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 h-5 bg-primary rounded-pill flex items-center justify-center text-white text-xs font-bold">3</span>
                                            <span className="text-primary text-base font-bold">玄関までの動線を確認</span>
                                        </div>
                                        <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">避難の最終ラインである玄関扉のすぐ横など、逃げながら無理なく掌める場所が理想的です。</p>
                                    </div>
                                </div>
                                <img src={tips5Svg} alt="非常持ち出し袋" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : question?.id === 'q9' ? (
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">家族に届けてもらうための共通認識を</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    家にいる家族に、絶対に持ってきもらいたい必需品(持病の薬、予備のめがね、補聴器など)を具体的に伝えておきましょう。
                                </p>
                                <img src={tips6Svg} alt="絶対に持っていく必需品" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : ['q10', 'q11', 'q12', 'q13', 'q14', 'q_pet', 'q_child', 'q_elder', 'q_disability', 'q_other'].includes(question?.id) ? (
                            <div className="bg-white rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-stone-900 text-xl mb-2">「もし担当者が不在なら？」という二段構えを</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-5 text-justify">
                                    平日の昼間などメインの担当者が不在の場合の「第2担当者」もセットで話し合いましょう。
                                </p>
                                <img src={tips7Svg} alt="第2担当者の確認" className="w-full h-auto mt-4 rounded-lg object-contain" />
                            </div>
                        ) : (
                            <div className="bg-surface rounded-input p-4 mb-6">
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

                    <div className="mb-4">
                        <label className="text-white text-xl font-bold mb-3 block">合意した避難場所</label>
                        <input
                            type="text"
                            value={agreedText}
                            onChange={(e) => setAgreedText(e.target.value)}
                            placeholder="南小学校"
                            className="w-full px-4 py-2.5 rounded-input bg-surface text-stone-900 placeholder-stone-300 text-base font-medium focus:outline-none transition-all"
                        />
                    </div>

                    <div className="bg-[#123C4B] rounded-lg px-3 py-2 mb-6">
                        <textarea
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder={"メモ用欄\n例）津波が来たら、避難所に向かわず近くのマンションへ逃げ込む"}
                            rows={3}
                            className="w-full bg-transparent text-primary text-base font-medium placeholder-primary/50 focus:outline-none resize-none leading-6"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleAgree}
                        disabled={saving}
                        className="w-full py-3 rounded-pill bg-accent text-white font-bold text-2xl shadow-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? '保存中...' : '全員で合意した'}
                    </button>
                </div>
            </div>
        </div>
    );
}
