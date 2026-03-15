/**
 * 青背景のフォームカード（見出し + 中身）
 */
export default function BlueFormCard({ title, children, className = '' }) {
    return (
        <div
            className={
                'bg-[#137FDE] rounded-[20px] px-7 py-7 flex flex-col gap-6 ' + (className || '')
            }
        >
            <h2 className="text-[#F9F9F9] font-bold text-[24px]">{title}</h2>
            {children}
        </div>
    );
}
