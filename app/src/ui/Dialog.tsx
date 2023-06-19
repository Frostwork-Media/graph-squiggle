import * as Dialog from "@radix-ui/react-dialog";
import { forwardRef } from "react";

const overlayClasses =
  "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 data-[state=open]:animate-overlayShow";

export const Overlay = forwardRef<HTMLDivElement, Dialog.DialogOverlayProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <Dialog.DialogOverlay
        {...props}
        ref={ref}
        className={`${overlayClasses} ${className}`}
      />
    );
  }
);

const contentClasses =
  "fixed z-50 w-[90vw] max-w-[400px] p-4 bg-white rounded-md shadow-lg flex flex-col gap-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-contentShow";

export const Content = forwardRef<HTMLDivElement, Dialog.DialogContentProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <Dialog.DialogContent
        {...props}
        ref={ref}
        className={`${contentClasses} ${className}`}
      />
    );
  }
);

const titleClasses = "text-2xl font-bold text-neutral-700";

export const Title = ({
  className = "",
  ...props
}: Dialog.DialogTitleProps) => {
  return (
    <Dialog.DialogTitle {...props} className={`${titleClasses} ${className}`} />
  );
};

const { Root, Description, Portal, Trigger, Close } = Dialog;

export { Root, Description, Portal, Trigger, Close };
