import React from 'react';

const BrainIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01.442-3.466l1.361-2.127a4.5 4.5 0 015.196-.51l.338.209a4.5 4.5 0 01.442 3.466l-.813 2.846m-5.196-5.196a4.5 4.5 0 00-5.196.51L3.75 12.559a4.5 4.5 0 00-.442 3.466l.813 2.846m5.196-5.196L9 18.75m0-2.846a4.5 4.5 0 015.196 5.196M14.25 7.5a4.5 4.5 0 10-4.666 5.333" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M16.5 6.375v.01M19.5 10.5v.01M21.75 15v.01M16.5 17.625v.01M12 21m-3.375-3.375v.01M9.375 12v.01M5.625 6.375v.01M12 9a.75.75 0 000 1.5.75.75 0 000-1.5z"/>
  </svg>
);

export default BrainIcon;
