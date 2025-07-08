
import React from 'react';

const FireIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-1.993-2.158A1.5 1.5 0 0 0 10.5 6a3.75 3.75 0 0 0-3.493 2.158 3.75 3.75 0 0 0-1.993 2.158c-.114.324-.114.67-.114 1.022s0 .698.114 1.022a3.75 3.75 0 0 0 1.993 2.158 3.75 3.75 0 0 0 3.493 2.158.75.75 0 0 0 .495-.125Z"
    />
  </svg>
);

export default FireIcon;
