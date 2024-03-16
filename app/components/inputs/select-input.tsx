import { getSelectProps, useField, type FieldName } from "@conform-to/react";
import { ReactNode } from "react";
import { cn } from "~/utils/cn";
import { inputStyle } from "./common";

type SelectInputProps = {
  name: FieldName<string>;
  label: string;
  children: ReactNode;

  className?: string;
};

export default function SelectInput(props: SelectInputProps) {
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
      <select
        {...getSelectProps(field)}
        className={cn(inputStyle, { "border-red-600": hasErrors })}
      >
        {props.children}
      </select>
      <div id={field.errorId} className="text-xs text-red-600">
        {field.errors}
      </div>
    </div>
  );
}
