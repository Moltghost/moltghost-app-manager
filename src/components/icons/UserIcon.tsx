import { SVGProps } from "react";

const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="17"
    height="19"
    viewBox="0 0 17 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.5 10.5C11.2614 10.5 13.5 8.26142 13.5 5.5C13.5 2.73858 11.2614 0.5 8.5 0.5C5.73858 0.5 3.5 2.73858 3.5 5.5C3.5 8.26142 5.73858 10.5 8.5 10.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 18.5C16.5 16.3783 15.6571 14.3434 14.1569 12.8431C12.6566 11.3429 10.6217 10.5 8.5 10.5C6.37827 10.5 4.34344 11.3429 2.84315 12.8431C1.34285 14.3434 0.5 16.3783 0.5 18.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default UserIcon;
