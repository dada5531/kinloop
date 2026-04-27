import React from "react";

interface LeafSprigProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function LeafSprig({ className, size, "aria-hidden": ariaHidden = true, ...props }: LeafSprigProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 30 Q -2 14 0 0 Q 4 -16 0 -30" fill="none" stroke="#5D8A5D" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 0 -8 Q -10 -10 -12 -2 Q -8 6 0 4" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M -8 -2 L -2 0" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
  <path d="M 0 -18 Q 12 -20 14 -10 Q 8 -2 0 -6" fill="#C2D8B8" stroke="#5D8A5D" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M 8 -10 L 2 -8" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
  <path d="M 0 18 Q -8 20 -10 12 Q -6 6 0 8" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M -6 12 L -2 12" stroke="#5D8A5D" stroke-width="1" opacity="0.6"/>
  

      </g>
    </svg>
  );
}
