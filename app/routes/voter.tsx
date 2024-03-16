import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/Button";
import TextInput from "~/components/inputs/text-input";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";

const voterJoinSchema = z.object({
  code: z.string().length(4),
});

export const meta: MetaFunction = () => {
  return [
    { title: "Voting Registration" },
    {
      name: "description",
      content: "Voter registration for election",
    },
  ];
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: voterJoinSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const code = submission.value.code;

  console.log(code);

  const id = context.cloudflare.env.VOTING_DO.idFromName("VOTING");
  const stub = context.cloudflare.env.VOTING_DO.get(id);
  const res = await stub.fetch("https://voter.com", {
    method: "post",
    body: "Hello do!",
  });

  // DO WHATEVER
  // Join room

  // bad request
  if (!res.ok) {
    return submission.reply({ formErrors: ["Bad request"] });
  }

  return redirect("/room");
};

export default function VoterJoin() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(voterJoinSchema),
    onValidate(context) {
      return parseWithZod(context.formData, { schema: voterJoinSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
  });

  return (
    <main className="flex-1 grid items-center justify-center max-w-sm">
      <FormProvider context={form.context}>
        <Form method="post" {...getFormProps(form)} autoComplete="off">
          <div>
            {form.errors?.map((e) => (
              <p className="text-red-600" key={e}>
                {e}
              </p>
            ))}
          </div>

          <TextInput label="Enter code" type="text" name={fields.code.name} />

          <Button type="submit">Join</Button>
        </Form>
      </FormProvider>
    </main>
  );
}
