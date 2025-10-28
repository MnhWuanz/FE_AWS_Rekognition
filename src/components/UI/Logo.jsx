import React from 'react';

function Logo({
  name = 'Saigon Technology University',
  imgSrc,
  height,
  width,
}) {
  const heightClass = height ? `h-${height}` : 'h-20';
  const widthClass = width ? `w-${width}` : 'w-20';
  return (
    <div className="flex items-center  ">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          className={`${heightClass} ${widthClass} rounded-xl object-contain bg-white p-1 shadow`}
        />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold">
          {name.split(' ')[0].slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="leading-tight">
        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          {name}
        </p>
        {name && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Education Portal
          </p>
        )}
      </div>
    </div>
  );
}
export default Logo;
