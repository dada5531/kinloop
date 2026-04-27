import React from "react";

interface MilestoneCognitiveProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MilestoneCognitive({ className, size, "aria-hidden": ariaHidden = true, ...props }: MilestoneCognitiveProps & React.SVGProps<SVGSVGElement>) {
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
  <path d="M 0 -3 L 0 -8" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 0 3 L 0 8" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M -3 0 L -8 0" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 3 0 L 8 0" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M -2 -2 L -6 -6" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 2 -2 L 6 -6" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M -2 2 L -6 6" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 2 2 L 6 6" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round"/>
  

      </g>
    </svg>
  );
}
