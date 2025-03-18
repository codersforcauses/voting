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
  say_something: "",
};

const NominationAdd = () => {
  const token = useToken()

  const mutation = useMutation({
    mutationFn: (data: FormSchema) => {
      return fetch(`${BASE_URL}/candidate`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  return (
    <NominationForm
      title="Add Nomination"
      btnText="Add nominee"
      defaultValues={defaultValues}
      sendRequest={mutation.mutateAsync}
    />
  );
};

export default NominationAdd;
