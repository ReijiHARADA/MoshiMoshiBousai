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
                'w-full h-9 rounded-lg bg-[#F9F9F9] px-4 text-[16px] font-medium text-[#484848] placeholder-[#CDCDCD] outline-none transition-colors ' +
                (className || '')
            }
            {...rest}
        />
    );
}
