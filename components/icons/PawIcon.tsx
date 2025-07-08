import React from 'react';

const PawIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M11.25 3.253a1.5 1.5 0 0 1 1.5 0v3.834a.374.374 0 0 0 .15.3l1.875 1.25a1.5 1.5 0 0 1 .632 1.932l-2.074 4.357a.375.375 0 0 0 .097.452l2.25 1.8a1.5 1.5 0 0 1-1.32 2.41l-2.583-.923a.375.375 0 0 0-.417.02l-3.375 2.531a1.5 1.5 0 0 1-1.84-2.13l2.087-3.912a.375.375 0 0 0-.07-.442l-2.03-2.03a1.5 1.5 0 0 1 .49-2.404l3.136-1.568a.375.375 0 0 0 .15-.3V3.253Z" />
  </svg>
);

export default PawIcon;
