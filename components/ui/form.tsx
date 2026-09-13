import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={`h-4 w-4 rounded border-stone-300 text-amber-800 focus:ring-amber-700 ${props.className ?? ""}`}
    />
  );
}
