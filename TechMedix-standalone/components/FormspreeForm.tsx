"use client";

import { useForm } from "@formspree/react";

interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormspreeFormProps {
  fields: FieldConfig[];
  subjectLine: string;
  submitLabel?: string;
  successMessage?: string;
}

export function FormspreeForm({
  fields,
  subjectLine,
  submitLabel = "Submit",
  successMessage = "Request received. We will be in touch within 24 hours.",
}: FormspreeFormProps) {
  const [state, handleSubmit] = useForm("xreyrndq");

  if (state.succeeded) {
    return (
      <div className="rounded-[16px] bg-moss/[0.08] border border-moss/20 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-black">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="_subject" value={subjectLine} />
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label
            htmlFor={field.name}
            className="text-xs font-medium text-black/60 uppercase tracking-[0.10em] font-ui"
          >
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
              className="rounded-[12px] border border-black/10 bg-black/[0.02] px-4 py-2.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-ember/40 resize-none"
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              className="rounded-[12px] border border-black/10 bg-black/[0.02] px-4 py-2.5 text-sm text-black focus:outline-none focus:border-ember/40"
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              required={field.required}
              className="rounded-[12px] border border-black/10 bg-black/[0.02] px-4 py-2.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-ember/40"
            />
          )}
        </div>
      ))}
      {state.errors && Array.isArray(state.errors) && state.errors.length > 0 && (
        <p className="text-xs text-ember">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={state.submitting}
        className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white hover:bg-[#e85d2a] disabled:opacity-50 transition-colors"
      >
        {state.submitting ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}
