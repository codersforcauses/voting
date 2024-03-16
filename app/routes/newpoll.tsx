import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/Button";
import TextInput from "~/components/inputs/text-input";
import { action } from "./voter";
import { z } from "zod";

const newPollSchema = z.object({
    title: z.string().min(1).max(30),
    candidates: z.string().min(1).max(100).array().nonempty(),
});

export default function NewPoll() {
    const lastResult = useActionData<typeof action>();

    const [form, fields] = useForm({
        lastResult,
        constraint: getZodConstraint(newPollSchema),
        onValidate(context) {
            return parseWithZod(context.formData, { schema: newPollSchema });
        },
        shouldValidate: "onSubmit",
        shouldRevalidate: "onInput",
    });

    const candidates = fields.candidates.getFieldList();

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

                    <TextInput label="Title" type="text" name={fields.title.name} />
                    {candidates.map((candidate, i) => (
                        <div key={`${candidate.name}${i}`} className="flex">
                            <TextInput label={`Candidate ${i + 1}`} type="text" name={candidate.name} />
                            <Button  {...form.remove.getButtonProps({
                                name: fields.candidates.name,
                                index: i
                            })}>x</Button>
                        </div>
                ))}

                    <Button {...form.insert.getButtonProps({
                        name: fields.candidates.name,
                    })}>Add Candidate</Button>

                    <Button type="submit">Create Poll</Button>
                </Form>
            </FormProvider>
        </main>
    )
}