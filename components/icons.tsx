
import React from 'react';

export const PlayerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M0 6H1V5H2V4H3V3H5V2H8V3H10V4H11V5H12V6H13V7H11V8H2V7H0V6Z" fill="#32CD32"/>
  </svg>
);

export const AlienIcon: React.FC<{ className?: string; frame: number }> = ({ className, frame }) => (
    <svg className={className} viewBox="0 0 11 8" fill="white" xmlns="http://www.w3.org/2000/svg">
      {frame === 0 ? (
        <path d="M3 0h1v1H3zm4 0h1v1H7zM2 1h1v1H2zm6 0h1v1H8zM1 2h9v1H1zM1 3h1v1H1zm2 0h1v1H3zm4 0h1v1H7zm2 0h1v1H9zM0 4h11v1H0zM2 5h1v1H2zm6 0h1v1H8zM0 6h2v1H0zm3 0h1v1H3zm4 0h1v1H7zm3 0h2v1H10z"/>
      ) : (
        <path d="M3 0h1v1H3zm4 0h1v1H7zM2 1h1v1H2zm6 0h1v1H8zM1 2h9v1H1zM0 3h1v1H0zm2 0h1v1H2zm4 0h1v1H6zm3 0h1v1H9zM0 4h11v1H0zM0 5h2v1H0zm3 0h1v1H3zm4 0h1v1H7zm3 0h2v1H10zM2 6h1v1H2zm6 0h1v1H8z"/>
      )}
    </svg>
);

export const UfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 7" xmlns="http://www.w3.org/2000/svg">
    {/* Fix: Corrected corrupted SVG path data. */}
    <path d="M4 0h8v1h2v1h1v1H1v-1h1V1h2V0zM3 3h10v1H3zM1 5h14v1H1z" fill="red"/>
  </svg>
);

export const ExplosionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 0H6V1H8V2H9V3H10V5H11V6H10V8H9V9H8V10H6V11H5V10H3V9H2V8H1V6H0V5H1V3H2V2H3V1H5V0Z" fill="#FFA500"/>
    <path d="M2 3L3 2L4 3L5 2L6 3L7 2L8 3L9 2L8 4L9 5L8 6L9 7L8 8L7 9L6 8L5 9L4 8L3 9L2 8L1 7L2 6L1 5L2 4L1 3L2 2Z" fill="white"/>
    <path d="M4 3H7V4H4V3ZM3 4H4V5H3V4ZM7 4H8V5H7V4ZM3 6H4V7H3V6ZM7 6H8V7H7V6ZM4 7H7V8H4V7Z" fill="#FF0000"/>
  </svg>
);

export const SpeakerOnIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.54 8.46C16.48 9.4 17 10.62 17 12C17 13.38 16.48 14.6 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.07 4.93C20.98 6.84 22 9.24 22 12C22 14.76 20.98 17.16 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const SpeakerOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 9L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 9L22 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);