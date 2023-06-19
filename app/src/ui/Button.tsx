import { forwardRef } from "react";

const baseButtonClasses = "px-4 py-2 rounded-md font-bold  disabled:opacity-50";
const buttonColors = {
  red: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  neutral:
    "bg-neutral-500 text-white hover:bg-neutral-600 active:bg-neutral-700",
  green: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
};

export const Button = forwardRef<
  HTMLButtonElement,
  {
    color?: keyof typeof buttonColors;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ color = "neutral", className = "", ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={`${baseButtonClasses} ${buttonColors[color]} ${className}`}
    />
  );
});
