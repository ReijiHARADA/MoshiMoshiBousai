/**
 * 青フォーム内の「ラベル + 補足文 + 入力欄」のまとまり
 */
export default function FieldBlock({ icon, label, description, children }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    {icon}
                    <span className="text-[#F9F9F9] font-bold text-[20px]">{label}</span>
                </div>
                <p className="text-[#F9F9F9] text-[12px] leading-[1.4] opacity-70 text-justify">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
}
