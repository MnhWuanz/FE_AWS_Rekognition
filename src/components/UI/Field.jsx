import React from 'react';

function Field({ label, children, required = false }) {
  return (
    <label className="block text-sm mb-3">
      <span className="block mb-1 text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default Field;
