
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75c0-5.056 2.383-9.555 6.084-12.436a6.75 6.75 0 0 1-5.77 1.745.75.75 0 0 1-.75-.75C9 9.366 9.075 8.463 9.315 7.584ZM12 6a.75.75 0 0 1 .75-.75c2.492 0 4.813 1.02 6.5 2.793a.75.75 0 0 1-1.06 1.06A7.476 7.476 0 0 0 12.75 7.5a.75.75 0 0 1-.75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

export default SparklesIcon;
