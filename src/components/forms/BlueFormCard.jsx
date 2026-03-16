/**
 * 青背景のフォームカード（見出し + 中身）
 */
export default function BlueFormCard({ title, children, className = '' }) {
    return (
        <div
            className={
                'bg-primary rounded-card px-7 py-7 flex flex-col gap-1 ' + (className || '')
            }
        >
            <h2 className="text-on-primary font-bold text-[24px]">{title}</h2>
            {children}
        </div>
    );
}
