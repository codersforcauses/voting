import { useMutation, useQuery } from "@tanstack/react-query";
import NominationForm, { type FormSchema } from "./form";

interface EditForm {
  id: number;
}

const NominationEdit = ({ id }: EditForm) => {
  const { data: defaultValues } = useQuery({
    queryKey: ["nomination", id],
    queryFn: () => {
      return fetch(`http://localhost:8787/admin/nominations/${id}`).then(
        (res) => res.json()
      );
    },
  });
  const mutation = useMutation({
    mutationFn: (data: FormSchema) => {
      return fetch(`http://localhost:8787/admin/nomination`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  return (
    <NominationForm
      title="Editing Nomination"
      btnText="Finish"
      defaultValues={defaultValues}
      sendRequest={mutation.mutateAsync}
    />
  );
};

export default NominationEdit;
