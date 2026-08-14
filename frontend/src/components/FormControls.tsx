interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        {...props}
        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${
          error
            ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
            : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
        } ${className}`}
      />
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        {...props}
        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${
          error
            ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
            : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
        } ${className}`}
      >
        <option value="">-- Chọn --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <textarea
        {...props}
        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${
          error
            ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
            : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
        } ${className}`}
      />
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`rounded-2xl font-semibold transition ${variantClasses[variant]} ${sizeClasses[size]} disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  );
}
