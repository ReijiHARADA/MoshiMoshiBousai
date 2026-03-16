/**
 * 青フォーム内の「ラベル + 補足文 + 入力欄」のまとまり
 */
export default function FieldBlock({ icon, label, description, children, required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="text-on-primary font-bold text-[20px]">{label}</span>
                    {required && (
                        <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-white text-[13px] font-bold leading-none text-[#FF7A1A]">
                            必須
                        </span>
                    )}
                </div>
                <p className="text-on-primary text-[12px] leading-[1.4] opacity-70 text-justify">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
}
