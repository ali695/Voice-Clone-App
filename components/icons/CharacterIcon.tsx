import React from 'react';

export const CharacterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 8.418a3 3 0 10-3.364 3.364l-3.364-3.364a3 3 0 103.364 3.364l3.364-3.364zM12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 15.91a3.375 3.375 0 01-4.772-4.772" />
    </svg>
);