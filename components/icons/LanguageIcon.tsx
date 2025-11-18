import React from 'react';

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c-3.485 0-6.43 2.89-6.43 6.471 0 3.58 2.945 6.47 6.43 6.47 3.485 0 6.43-2.89 6.43-6.47S15.485 3.75 12 3.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
    </svg>
);
