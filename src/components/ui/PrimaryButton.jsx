/**
 * 青フォーム内のメイン送信ボタン（白背景・青文字・角丸）
 */
export default function PrimaryButton({ type = 'button', onClick, disabled, children, className = '' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={
                'w-full h-button rounded-pill bg-surface flex items-center justify-center shadow-button transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ' +
                (className || '')
            }
        >
            <span className="text-primary font-bold text-[20px]">{children}</span>
        </button>
    );
}
