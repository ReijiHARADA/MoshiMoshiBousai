import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Printer, PawPrint, Baby, Heart, ClipboardList } from 'lucide-react';

/**
 * 防災シート確認モーダル。同居用・別世帯版カードのプレビュー、画像保存・印刷。
 */
export function SheetModal({
    onClose,
    questionCards,
    agreements,
    answers,
    users,
    cohabitingUsers,
    separateUsers,
}) {
    const cardRefs = useRef([]);
    const previewRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [cardScale, setCardScale] = useState(1);

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const CARD_WIDTH = 800;
        const calcScale = () => {
            const containerWidth = el.offsetWidth - 32;
            setCardScale(Math.min(containerWidth / CARD_WIDTH, 1));
        };
        calcScale();
        const ro = new ResizeObserver(calcScale);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

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
        if (raw.trim().toLowerCase() === 'admin') return '';
        return raw;
    };

    const getIndividualAnswers = (qId) => {
        return users
            .map((user) => {
                const ans = answers.find((a) => a.questionId === qId && a.userId === user.id);
                return { user, answerText: ans?.answerText || '', memoText: ans?.memoText || '' };
            })
            .filter((a) => a.answerText.trim().length > 0);
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

                if (i < cardsToExport.length - 1) {
                    await new Promise((res) => setTimeout(res, 500));
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
            if (!printWindow) {
                alert('ポップアップがブロックされました。');
                return;
            }

            const imgElements = dataUrls
                .map((url) => `<div class="page"><img src="${url}" /></div>`)
                .join('');

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

    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] bg-white flex flex-col sheet-modal">
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

            <div ref={previewRef} className="flex-1 overflow-auto px-4 pb-4">
                <div
                    style={{
                        width: '800px',
                        transformOrigin: 'top left',
                        transform: `scale(${cardScale})`,
                    }}
                    className="flex flex-col gap-8"
                >
                    {/* 同居家族用カード */}
                    <div
                        ref={(el) => (cardRefs.current[0] = el)}
                        className="bg-white rounded-lg overflow-hidden border border-gray-200"
                        style={{ width: '800px', minHeight: '565px', fontFamily: "'Zen Maru Gothic', sans-serif" }}
                    >
                        <div className="flex items-center justify-center gap-4 pt-6 pb-3 px-8">
                            <div className="flex-1 h-[1px] bg-black" />
                            <h2 className="text-sky-600 text-xl font-bold tracking-wide">もしもし防災カード</h2>
                            <div className="flex-1 h-[1px] bg-black" />
                        </div>

                        <div className="px-8 pb-6">
                            <div className="grid grid-cols-4 gap-0 mb-4">
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

                                <div className="border-r border-gray-300 px-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">伝言ルール</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline">{messagePlace || '—'}</p>
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {messagePlaceMemo || '家族全員が必ず見る場所を決めておく。'}
                                    </p>
                                </div>

                                <div className="border-r border-gray-300 px-3 text-center">
                                    <div className="bg-sky-600 rounded-[3px] px-2 py-1.5 mb-2 text-center">
                                        <span className="text-white text-xs font-bold">優先してもっていく物</span>
                                    </div>
                                    <p className="font-bold text-black text-xs underline">{priorityItems || '—'}</p>
                                    <p className="text-neutral-700 text-[8px] mt-1.5 leading-relaxed">
                                        {priorityItemsMemo || '貴重品、水、薬など最低限をリストアップしておく。'}
                                    </p>
                                </div>

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

                            <div className="bg-sky-600 rounded-xl p-4 mb-4">
                                <div className="flex gap-4 mb-3">
                                    <span className="text-white text-xs font-bold text-center shrink-0">避難場所（在宅時）</span>
                                    <span className="text-white text-xs font-bold text-center flex-1">避難場所（仕事・学校に行っている時）</span>
                                </div>
                                <div className="flex gap-4">
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

                                    <div className="bg-white rounded-[5px] p-3 flex-1">
                                        <div className="flex gap-3 flex-wrap justify-center">
                                            {outsideEvacAnswers.length > 0 ? (
                                                outsideEvacAnswers.map(({ user, answerText, memoText }) => {
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
                                                })
                                            ) : (
                                                <p className="text-neutral-400 text-sm">—</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                <div className="flex items-center justify-center gap-4 pt-6 pb-3 px-8">
                                    <div className="flex-1 h-[1px] bg-black" />
                                    <h2 className="text-sky-600 text-xl font-bold tracking-wide">もしもし防災カード</h2>
                                    <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">別世帯版</span>
                                    <div className="flex-1 h-[1px] bg-black" />
                                </div>

                                <div className="px-8 pb-6">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">名前</span>
                                            </div>
                                            <p className="font-bold text-black text-sm">{user.name}</p>
                                        </div>

                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">緊急時の連絡手段</span>
                                            </div>
                                            <p className="font-bold text-black text-xs underline mb-0.5">1.{contactMethod || '—'}</p>
                                            {contactBackup && <p className="font-bold text-black text-xs underline">2.{contactBackup}</p>}
                                        </div>

                                        <div className="text-center">
                                            <div className="bg-sky-600 rounded-sm px-2 py-1.5 mb-2 text-center">
                                                <span className="text-white text-xs font-bold">伝言ルール</span>
                                            </div>
                                            <p className="font-bold text-black text-xs underline">{messagePlace || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-sky-600 rounded-[5px] p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <span className="text-white text-xs font-bold mb-2 block text-center">避難場所（在宅時）</span>
                                                <div className="bg-white rounded p-3 text-center">
                                                    <p className="font-bold text-black text-xs underline mb-1">{sepHomeEvac || '—'}</p>
                                                    {sepHomeMemo && <p className="text-neutral-700 text-[8px] leading-relaxed">{sepHomeMemo}</p>}
                                                </div>
                                            </div>
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

            <div className="flex-shrink-0 px-6 pb-8 pt-4 space-y-3 no-print">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 rounded-pill bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    {saving ? '保存中...' : '写真に保存'}
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-4 rounded-pill bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Printer className="w-5 h-5" />
                    印刷
                </button>
            </div>
        </div>
    );
}
