import { ComponentPropsWithoutRef } from "react";
import { cn } from "~/utils/cn";

export const Button = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      {...props}
      className={cn("px-1 py-0.5 rounded text-white text-center", className)}
    />
  );
};
