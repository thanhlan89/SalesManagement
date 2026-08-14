import { useToast } from '../hooks/useToast';

function Toast() {
  const { toasts, removeToast } = useToast();

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
      default:
        return 'bg-sky-50 border-sky-200 text-sky-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 border rounded-2xl px-4 py-3 shadow-lg animate-in slide-in-from-right ${getBackgroundColor(
            toast.type
          )}`}
        >
          <span className="text-lg font-bold">{getIcon(toast.type)}</span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg font-bold hover:opacity-70 transition"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
