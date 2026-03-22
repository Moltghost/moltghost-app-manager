import { SVGProps } from "react";

const WalletIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14.5 11.5H14.51"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 4.5H16.5C17.0304 4.5 17.5391 4.71071 17.9142 5.08579C18.2893 5.46086 18.5 5.96957 18.5 6.5V16.5C18.5 17.0304 18.2893 17.5391 17.9142 17.9142C17.5391 18.2893 17.0304 18.5 16.5 18.5H2.5C1.96957 18.5 1.46086 18.2893 1.08579 17.9142C0.710714 17.5391 0.5 17.0304 0.5 16.5V2.5C0.5 1.96957 0.710714 1.46086 1.08579 1.08579C1.46086 0.710714 1.96957 0.5 2.5 0.5H16.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default WalletIcon;
