import { useNavigate } from 'react-router-dom';

export default function BackButton() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 text-sm font-medium active:scale-95 transition-all bg-primary text-white hover:bg-primary-hover w-fit"
        >
            <span aria-hidden="true">←</span>
            <span>戻る</span>
        </button>
    );
}

