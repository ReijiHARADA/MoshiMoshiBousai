import familyIllustration from '../../../assets/family.svg';

/**
 * 完了スライド。全問回答済み＝オレンジ、未回答あり＝グレー。ボタン文言・表示内容は既存維持。
 */
export function CompletionCard({
    allAnswered,
    totalQuestions,
    saving,
    dispTot,
    onSaveAndNavigate,
    onGoToFirstUnanswered,
}) {
    if (allAnswered) {
        return (
            <div className="h-full flex-shrink-0 flex flex-col py-1" style={{ width: '100%' }}>
                <div className="flex-1 rounded-card px-5 py-4 flex flex-col shadow-xl overflow-hidden bg-accent">
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
                            onClick={onSaveAndNavigate}
                            disabled={saving}
                            className="w-full h-[50px] rounded-pill font-bold text-[18px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-white text-accent hover:opacity-90"
                        >
                            {saving ? '保存中...' : '家族の回答と比較する'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex-shrink-0 flex flex-col py-1" style={{ width: '100%' }}>
            <div className="flex-1 rounded-card px-5 py-4 flex flex-col shadow-xl overflow-hidden bg-disabled">
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
                        onClick={onGoToFirstUnanswered}
                        className="w-full h-[50px] rounded-full font-bold text-[18px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-white text-[#5a5a5a] hover:opacity-90"
                    >
                        未回答の質問に戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
