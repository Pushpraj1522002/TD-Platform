import * as React from "react";

export default function FormInput({ label, type = "text", id, value, onChange, required }) {
  // Use the provided id or generate one from the label
  const inputId = id || `${label.toLowerCase()}Input`;
  
  return (
    <>
      <label htmlFor={inputId} className="mt-7  font-medium text-white max-md:mt-10">
        {label}
      </label>
      <input
        type={type}
        id={inputId}
        value={value}
        onChange={onChange}
        required={required}
        className="flex shrink-0 self-stretch mt-1 rounded-xl bg-zinc-700 h-[38px] shadow-[0px_2px_4px_rgba(0,0,0,0.12)]"
        aria-label={label}
      />
    </>
  );
}