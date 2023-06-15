import { ComponentProps, forwardRef, JSXElementConstructor } from "react";
import { Plus } from "phosphor-react";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type PolymorphicRef<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = T extends JSXElementConstructor<infer P>
  ? P extends { ref?: infer R }
    ? R
    : never
  : never;

export const IconButton = forwardRef(function IconButtonWithRef<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
>(
  props: {
    as: T;
    icon: typeof Plus;
    className?: string;
    size?: number;
  } & Prettify<ComponentProps<T>>,
  ref: PolymorphicRef<T>
) {
  const {
    children,
    size = 24,
    icon,
    as = "button",
    className = "",
    ...rest
  } = props;
  const Icon = icon;
  const Comp = as;
  return (
    <Comp
      className={`p-1 rounded-md hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      {...rest}
      ref={ref}
    >
      <Icon size={size} />
    </Comp>
  );
});
