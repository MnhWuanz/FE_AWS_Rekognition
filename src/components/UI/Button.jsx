import React from 'react';

function Button({ children, ...props }) {
  return (
    <button
      className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium px-4 py-2.5 transition disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
