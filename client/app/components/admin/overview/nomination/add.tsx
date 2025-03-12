import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
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
      .array(z.string())
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

type FormSchema = z.infer<typeof formSchema>;

const positions = [
  { id: "president", label: "President" },
  { id: "vp", label: "Vice President" },
  { id: "secretary", label: "Secretary" },
  { id: "treasurer", label: "Treasurer" },
  { id: "techlead", label: "Technical Lead" },
  { id: "marketing", label: "Marketing Officer" },
  { id: "fresher", label: "Fresher Representative" },
  { id: "ocm", label: "Ordinary Committee Member" },
];

const defaultValues = {
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
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isAttending = form.watch("attend");

  const mutation = useMutation({
    mutationFn: (data: FormSchema) => {
      return fetch(`http://localhost:8787/admin/nomination`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  // TODO: Add the onSubmit function
  const onSubmit = async (data: FormSchema) => {
    try {
      console.log({
        ...data,
        say_something: isAttending ? "" : data.say_something,
      });

      // const response = await mutation.mutateAsync(data);
      // const nominee = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DialogContent className="h-full sm:max-w-5xl max-h-11/12">
      <DialogHeader>
        <DialogTitle>Add Nomination</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          id="nomination-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 overflow-auto"
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
          <FormField
            control={form.control}
            name="attend"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>They able to attend the AGM</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="positions"
            render={() => (
              <FormItem>
                <FormLabel className="font-mono">Positions applied</FormLabel>
                <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                  {positions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="positions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
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
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
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
        <Button form="nomination-form" type="submit">
          Add Nominee
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NominationAdd;
