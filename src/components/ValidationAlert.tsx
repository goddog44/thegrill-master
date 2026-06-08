import { X, AlertCircle } from 'lucide-react';

interface ValidationAlertProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'error' | 'warning' | 'success';
}

export const ValidationAlert = ({
  message,
  isOpen,
  onClose,
  type = 'error',
}: ValidationAlertProps) => {
  if (!isOpen) return null;

  const bgColor = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    success: 'bg-emerald-50 border-emerald-200',
  };

  const textColor = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    success: 'text-emerald-800',
  };

  const iconColor = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    success: 'text-emerald-600',
  };

  const buttonColor = {
    error: 'hover:bg-red-100 text-red-600',
    warning: 'hover:bg-yellow-100 text-yellow-600',
    success: 'hover:bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className={`${bgColor[type]} border-2 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 mt-1 p-2 rounded-lg ${bgColor[type]}`}>
            <AlertCircle className={`${iconColor[type]}`} size={24} />
          </div>
          <div className="flex-1">
            <p className={`${textColor[type]} font-semibold text-base leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${buttonColor[type]} p-1 rounded-lg transition-colors flex-shrink-0`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
              type === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : type === 'warning'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};
