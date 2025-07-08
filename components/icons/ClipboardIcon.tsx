
import React from 'react';

const ClipboardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-6.75c-.621 0-1.125-.504-1.125-1.125v-3.375m11.25-4.5v-3.375c0-.621-.504-1.125-1.125-1.125h-.521a3 3 0 0 0-2.34-1.633A3 3 0 0 0 12 4.5c-1.03 0-1.933.516-2.48 1.342a3 3 0 0 0-2.34 1.633h-.521c-.621 0-1.125.504-1.125 1.125v3.375m11.25-4.5h-9" />
    </svg>
);

export default ClipboardIcon;
