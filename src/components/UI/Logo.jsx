import React from 'react';

function Logo({
  name = 'Saigon Technology University',
  imgSrc,
  height,
  widthParent,
}) {
  const parentStyle = { 
    width: widthParent || '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px'
  };
  return (
    <div className="flex items-center" style={{ width: '100%', flexDirection: 'column' }}>
      <div style={parentStyle}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="rounded-xl object-contain bg-white p-1 shadow"
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '100%',
              maxHeight: height ? `${height}px` : '150px',
              minHeight: '80px'
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold">
            {name.split(' ')[0].slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {name && (
        <div className="leading-tight" style={{ width: '100%', textAlign: 'center', padding: '0 10px' }}>
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {name}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Education Portal
          </p>
        </div>
      )}
    </div>
  );
}
export default Logo;
