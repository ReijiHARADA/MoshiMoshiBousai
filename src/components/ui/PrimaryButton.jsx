/**
 * 青フォーム内のメイン送信ボタン（白背景・青文字・角丸）
 * disabled 時はグレーピル＋白文字で「未回答」カードとトーンを合わせる。
 * disabled 状態でタップされた場合は、軽いハプティクスを返す。
 */
export default function PrimaryButton({ type = 'button', onClick, disabled, children, className = '' }) {
    const isDisabled = !!disabled;

    const baseClasses =
        'w-full h-button rounded-pill flex items-center justify-center shadow-button transition-opacity ';
    const enabledClasses = 'bg-surface hover:opacity-90 active:opacity-80';
    const disabledClasses = 'bg-disabled opacity-100 cursor-not-allowed';

    const handleClick = (event) => {
        if (isDisabled) {
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
            return;
        }

        if (onClick) {
            onClick(event);
        }
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            aria-disabled={isDisabled}
            className={
                baseClasses +
                (isDisabled ? disabledClasses : enabledClasses) +
                ' ' +
                (className || '')
            }
        >
            <span
                className={
                    isDisabled
                        ? 'text-white font-bold text-[20px] opacity-70'
                        : 'text-primary font-bold text-[20px] opacity-100'
                }
            >
                {children}
            </span>
        </button>
    );
}
