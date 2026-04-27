import React from "react";

interface MilestoneLanguageProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MilestoneLanguage({ className, size, "aria-hidden": ariaHidden = true, ...props }: MilestoneLanguageProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(40, 40)">

  <circle cx="0" cy="0" r="14" fill="#E1F5EE" stroke="#5D8A5D" stroke-width="1.5"/>
  <path d="M -7 -4 Q -7 -7 -3 -7 L 6 -7 Q 8 -7 8 -4 L 8 1 Q 8 4 4 4 L 0 4 L -2 7 L -4 4 Q -7 4 -7 1 Z" fill="none" stroke="#5D8A5D" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  
      </g>
    </svg>
  );
}
