


import React from "react";

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className: string;
  children: React.ReactNode;
}

export function Button({ onClick, className, children }: ButtonProps) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg ${className}`}>
      {children}
    </button>
  );
}