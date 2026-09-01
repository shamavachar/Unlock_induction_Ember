import React from "react";

export const Input = React.forwardRef(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <input ref={ref} className={`form-input ${className}`} {...props} />
        {error && <p className="form-error">{error}</p>}
        {helperText && !error && (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
