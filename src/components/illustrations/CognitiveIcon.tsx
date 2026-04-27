import React from "react";

interface CognitiveIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function CognitiveIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: CognitiveIconProps & React.SVGProps<SVGSVGElement>) {
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

  
      </g>
    </svg>
  );
}
