import React from "react";

interface MilestoneMotorProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function MilestoneMotor({ className, size, "aria-hidden": ariaHidden = true, ...props }: MilestoneMotorProps & React.SVGProps<SVGSVGElement>) {
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
  <ellipse cx="0" cy="2" rx="4" ry="6" fill="#5D8A5D"/>
  <circle cx="-3" cy="-4" r="1.4" fill="#5D8A5D"/>
  <circle cx="3" cy="-4" r="1.6" fill="#5D8A5D"/>
  <circle cx="-4" cy="-1" r="1.2" fill="#5D8A5D"/>
  <circle cx="4" cy="-1" r="1.4" fill="#5D8A5D"/>
  

      </g>
    </svg>
  );
}
