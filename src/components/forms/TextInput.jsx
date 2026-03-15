/**
 * 青フォーム用のテキスト入力（薄灰背景・角丸）
 */
export default function TextInput({ value, onChange, placeholder, className = '', ...rest }) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={
                'w-full h-input rounded-input bg-surface px-4 text-[16px] font-medium text-text placeholder-text-muted outline-none transition-colors ' +
                (className || '')
            }
            {...rest}
        />
    );
}
