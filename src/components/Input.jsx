import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="form-label fw-bold">{label}</label>}
      <input className={`form-control ${error ? 'is-invalid' : ''}`} {...props} />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Input;
