
import React from 'react';

const HammerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m-3.75 3.75L3.75 21m12.375-12.375L3.75 3.75m3.75 0h.375c1.035 0 2.002.166 2.91.479m-.375 0c1.065.326 2.064.786 2.962 1.352m-3.75 0c-1.33.635-2.537 1.45-3.596 2.448m-5.132 5.132c-1.066 1.066-1.684 2.47-1.684 3.966 0 1.495.618 2.9 1.684 3.966m10.26-10.26c1.066-1.066 2.47-1.684 3.966-1.684 1.496 0 2.9.618 3.966 1.684m-10.26 10.26L21 3.75" />
  </svg>
);

export default HammerIcon;
