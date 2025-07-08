import React from 'react';

const UserGroupIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A4.998 4.998 0 0019.5 15c0-1.74-1.01-3.25-2.5-4.032M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636m0 0A4.998 4.998 0 0112 5.25a4.998 4.998 0 015.636 5.636m-11.272 0a4.998 4.998 0 015.636-5.636" />
  </svg>
);

export default UserGroupIcon;
