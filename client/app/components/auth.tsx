import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/user";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(2, {
      message: "Email is required",
    }),
  code: z.string().length(6, {
    message: "Enter the 6 digit code",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const defaultValues = {
  email: "",
  code: "",
};

const Auth = ({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<User>>;
}) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: FormSchema) => {
      return fetch(`http://localhost:8787/auth`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      const response = await mutation.mutateAsync(data);
      if (response.status === 404) {
        form.setError("email", {
          type: "manual",
          message: "User not found",
        });
        throw new Error("User not found");
      } else if (response.status === 401) {
        form.setError("email", {
          type: "manual",
          message: "User is not a CFC member",
        });
      } else {
        const user = await response.json();
        window.sessionStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen p-6 md:p-10">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-xl font-bold">CFC AGM 2025</h1>
          <div className="text-sm text-muted-foreground">
            Please log in to continue
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
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
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="flex-1">
                        <InputOTPSlot index={0} className="w-full" />
                        <InputOTPSlot index={1} className="w-full" />
                        <InputOTPSlot index={2} className="w-full" />
                        <InputOTPSlot index={3} className="w-full" />
                        <InputOTPSlot index={4} className="w-full" />
                        <InputOTPSlot index={5} className="w-full" />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Please notify a committee member to receive your code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              Continue
            </Button>
          </form>
        </Form>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
          If you do not have an account with us, please sign up on our{" "}
          <a href="https://codersforcauses.org/join">website</a> or talk to a
          committee member.
        </div>
      </div>
    </div>
  );
};

export default Auth;
