import { type FieldName, getInputProps, useField } from "@conform-to/react";
import { cn } from "~/utils/cn";
import { inputStyle } from "./common";

type NumberInputProps = {
  name: FieldName<number>;
  label: string;
  autoFocus?: boolean;

  className?: string;
};

export default function NumberInput(props: NumberInputProps) {
  const [field] = useField(props.name);
  const hasErrors = !!field.errors?.length;

  return (
    <div className={cn("flex flex-col gap-0.5 pb-1", props.className)}>
      <label
        htmlFor={field.id}
        className={cn("leading-0 text-xs", { "text-red-600": hasErrors })}
      >
        {props.label}
        {field.required && (
          <>
            &nbsp;<span>*</span>
          </>
        )}
      </label>
      <input
        {...getInputProps(field, { type: "number" })}
        className={cn(inputStyle, { "border-red-600": hasErrors })}
      />
      <div id={field.errorId} className="text-xs text-red-600">
        {field.errors}
      </div>
    </div>
  );
}
