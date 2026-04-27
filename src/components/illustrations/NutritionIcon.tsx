import React from "react";

interface NutritionIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function NutritionIcon({ className, size, "aria-hidden": ariaHidden = true, ...props }: NutritionIconProps & React.SVGProps<SVGSVGElement>) {
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

    <path d="M 0 0 Q 4 -6 10 -4 Q 6 0 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.4"/>
    <path d="M 4 -1 L 4 6" fill="none" stroke="#5D8A5D" stroke-width="1.2" stroke-linecap="round"/>
  
      </g>
    </svg>
  );
}
