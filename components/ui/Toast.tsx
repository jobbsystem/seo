import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    onClose: (id: string) => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const styles = {
        success: "border-emerald-100 bg-emerald-50/80 text-emerald-900",
        error: "border-red-100 bg-red-50/80 text-red-900",
        info: "border-blue-100 bg-blue-50/80 text-blue-900"
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-fade-in mb-3 min-w-[300px] ${styles[type]}`}>
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="shrink-0 hover:bg-black/5 p-1 rounded-full transition-colors"
            >
                <X size={14} className="opacity-50 hover:opacity-100" />
            </button>
        </div>
    );
};

export default Toast;
