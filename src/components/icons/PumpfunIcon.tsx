import { SVGProps } from "react";

const PumpfunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="7.5"
      y="2.5"
      width="9"
      height="19"
      rx="4.5"
      transform="rotate(30 12 12)"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="12"
      y1="8.5"
      x2="12"
      y2="15.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      transform="rotate(30 12 12)"
    />
  </svg>
);

export default PumpfunIcon;
