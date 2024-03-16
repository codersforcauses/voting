type IntentProps = {
  value: string;
};

export const Intent = (props: IntentProps) => {
  return <input type="hidden" name="intent" value={props.value} />;
};
