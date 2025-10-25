import React from 'react';

function Input({ type = 'text', placeholder, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 dark:text-gray-100"
      {...props}
    />
  );
}

export default Input;
