import React from "react";

interface MilestoneAchievedProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MilestoneAchieved({ className, size, "aria-hidden": ariaHidden = true, ...props }: MilestoneAchievedProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 -28 L 8 -8 L 28 -4 L 14 8 L 18 28 L 0 18 L -18 28 L -14 8 L -28 -4 L -8 -8 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="0" cy="2" r="1.4" fill="#5D8A5D" opacity="0.5"/>
  <circle cx="35" cy="-26" r="2" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.2"/>
  <circle cx="-32" cy="-30" r="1.6" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.2"/>
  <circle cx="38" cy="14" r="1.8" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.2"/>
  <circle cx="-38" cy="10" r="1.4" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.2"/>
  <circle cx="22" cy="-32" r="1.2" fill="#5D8A5D" opacity="0.6"/>
  <circle cx="-20" cy="34" r="1.2" fill="#5D8A5D" opacity="0.6"/>
  

      </g>
    </svg>
  );
}
