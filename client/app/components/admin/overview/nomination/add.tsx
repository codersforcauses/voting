import { useMutation } from "@tanstack/react-query";
import NominationForm, { type FormSchema } from "./form";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

const defaultValues: FormSchema = {
  name: "",
  student_num: "",
  graduation: "",
  email: "",
  positions: [],
  join_reason: "",
  club_benefit: "",
  initiative: "",
  other_clubs: "",
  past_clubs: "",
  attend: false,
  isMember: false,
  say_something: "",
};

const NominationAdd = ({ close }: { close: () => void }) => {
  const token = useToken();

  const mutation = useMutation({
    mutationFn: async ({ isMember, ...data }: FormSchema) => {
      const response = await fetch(`${BASE_URL}/candidate`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const val = await response.json();
      return val;
    },
  });

  return (
    <NominationForm
      title="Add Nomination"
      btnText="Add nominee"
      defaultValues={defaultValues}
      sendRequest={mutation.mutateAsync}
      close={close}
    />
  );
};

export default NominationAdd;
