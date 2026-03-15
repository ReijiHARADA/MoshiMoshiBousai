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
                'w-full h-[46px] rounded-full bg-[#F9F9F9] flex items-center justify-center shadow-[0_0_11.5px_0_rgba(93,93,93,0.50)] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ' +
                (className || '')
            }
        >
            <span className="text-[#137FDE] font-bold text-[20px]">{children}</span>
        </button>
    );
}
