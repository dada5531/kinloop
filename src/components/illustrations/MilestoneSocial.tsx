import React from "react";

interface MilestoneSocialProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MilestoneSocial({ className, size, "aria-hidden": ariaHidden = true, ...props }: MilestoneSocialProps & React.SVGProps<SVGSVGElement>) {
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

    <path d="M 0 0 Q 2 -3 5 -2 Q 3 0 0 0 Z" fill="#5D8A5D"/>
    <path d="M 2 -1 L 2 2" stroke="#5D8A5D" stroke-width="1" stroke-linecap="round"/>
  
      </g>
    </svg>
  );
}
