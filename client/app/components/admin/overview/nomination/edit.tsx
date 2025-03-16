import { useMutation, useQuery } from "@tanstack/react-query";
import NominationForm, { type FormSchema } from "./form";
import { BASE_URL } from "@/lib/utils";

interface EditForm {
  id: number;
}

const NominationEdit = ({ id }: EditForm) => {
  const { data: defaultValues } = useQuery({
    queryKey: ["nomination", id],
    queryFn: () =>
      fetch(`${BASE_URL}/admin/nominations/${id}`).then((res) => res.json()),
  });
  const mutation = useMutation({
    mutationFn: (data: FormSchema) =>
      fetch(`${BASE_URL}/admin/nomination`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
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
