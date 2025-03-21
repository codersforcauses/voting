import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, type UseMutateAsyncFunction } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name is required",
    }),
    student_num: z.string().min(2, {
      message: "Student number is required",
    }),
    graduation: z.string().min(2, {
      message: "Graduation date is required",
    }),
    email: z
      .string()
      .email({
        message: "Invalid email address",
      })
      .min(2, {
        message: "Email is required",
      }),
    positions: z
      .array(z.number())
      .refine((value) => value.some((item) => item), {
        message: "At least one position must be selected",
      }),
    join_reason: z.string().min(2, {
      message: "Reason for joining is required",
    }),
    club_benefit: z.string().min(2, {
      message: "Benefit to the club is required",
    }),
    initiative: z.string().min(2, {
      message: "Club initiative is required",
    }),
    other_clubs: z.string().min(2, {
      message: "Other club commitments are required",
    }),
    past_clubs: z.string().min(2, {
      message: "Club committee history is required",
    }),
    isMember: z.boolean().default(false),
    attend: z.boolean(),
    say_something: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.attend && !data.say_something) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "If the nominee is unable to attend, their statement must be provided",
        path: ["say_something"],
      });
    }
  });

export type FormSchema = z.infer<typeof formSchema>;

interface NominationFormProps {
  title: string;
  btnText: string;
  defaultValues: FormSchema;
  sendRequest: UseMutateAsyncFunction<Response, Error, FormSchema, unknown>;
}

const NominationForm = (props: NominationFormProps) => {
  const token = useToken();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: props.defaultValues,
  });

  const { data: positionsList } = useQuery<{ id: number; title: string }[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/position`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
    staleTime: 0,
  });

  const isAttending = form.watch("attend");

  const onSubmit = async (data: FormSchema) => {
    try {
      const nominee = {
        ...data,
        say_something: isAttending ? "" : data.say_something,
      };
      await props.sendRequest(nominee);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DialogContent className="h-full sm:max-w-5xl max-h-11/12">
      <DialogHeader>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogDescription>
          Please fill out the form below to nominate a new committee member
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          id="nomination-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 py-4 overflow-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="student_num"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">Student number</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">
                    Expected graduation date
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="mm/yy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="attend"
              render={({ field }) => (
                <FormItem className="flex items-center gap-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="pl-4">
                    They are able to attend the AGM
                  </FormLabel>
                </FormItem>
              )}
            />
            {props.title.toLocaleLowerCase().includes("edit") && (
              <FormField
                control={form.control}
                name="isMember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="pl-4">
                      They are a CFC member
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="positions"
            render={() => (
              <FormItem>
                <FormLabel className="font-mono">Positions applied</FormLabel>
                <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                  {positionsList?.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="positions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start gap-0 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal pl-4">
                              {item.title}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  )) ?? "Loading positions..."}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="join_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">
                  Nominee's reason for wanting to join?
                </FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="club_benefit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">
                  How would nominee benefit the club?
                </FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initiative"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">
                  Initiatives or events nominee would run if elected?
                </FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="other_clubs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">
                    Are they a committee member of another club?
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Club and position held in the club
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="past_clubs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">
                    Were they a committee member of another club?
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Club and position held in the club
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!isAttending && (
            <FormField
              control={form.control}
              name="say_something"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">
                    What should be said on their behalf at the AGM?
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
      <DialogFooter>
        <Button
          disabled={form.formState.isSubmitting}
          form="nomination-form"
          type="submit"
        >
          {props.btnText}
          {form.formState.isSubmitting && (
            <span className="material-symbols-sharp ml-2 animate-spin">
              progress_activity
            </span>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NominationForm;
