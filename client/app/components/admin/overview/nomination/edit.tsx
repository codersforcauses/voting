import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NominationForm, { type FormSchema } from "./form";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

interface EditForm {
  id: number;
  close: () => void;
}

const NominationEdit = ({ id }: EditForm) => {
  const token = useToken();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    enabled: id !== -1,
    queryKey: ["nomination", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/candidate/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const [val] = await response.json();
      return val;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const response = await fetch(`${BASE_URL}/candidate/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const val = await response.json();
      return val;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominees", "all"] });
    },
  });

  const defaultValues = data
    ? {
        ...data,
        positions: data?.nominations.map(
          ({ positions }: { positions: { id: number; title: string } }) =>
            positions.id
        ),
      }
    : null;

  return (
    defaultValues && (
      <NominationForm
        title="Editing Nomination"
        btnText="Finish"
        defaultValues={defaultValues}
        sendRequest={mutation.mutateAsync}
        close={close}
      />
    )
  );
};

export default NominationEdit;
