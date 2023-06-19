import { forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  {} & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={`rounded border border-gray-300 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        props.className ?? ""
      }`}
    />
  );
});
