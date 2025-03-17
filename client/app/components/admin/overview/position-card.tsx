import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  president: z.string(),
  vp: z.string(),
  secretary: z.string(),
  treasurer: z.string(),
  techlead: z.string(),
  marketing: z.string(),
  fresher: z.string(),
  ocm: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const defaultValues = {
  president: "1",
  vp: "1",
  secretary: "1",
  treasurer: "1",
  techlead: "1",
  marketing: "1",
  fresher: "1",
  ocm: "6",
};

const PositionCard = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormSchema) => {
    console.log(data);
  };

  return (
    <Collapsible className="md:col-span-3 lg:col-span-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="tracking-light">
              Positions Available
            </CardTitle>
            <CardDescription>
              Modify how many positions are available on each role
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="material-symbols-sharp">expand_all</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent className="flex flex-col gap-6">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid md:grid-cols-3 gap-y-2 gap-x-4"
              >
                <FormField
                  control={form.control}
                  name="president"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">President</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">
                        Vice president
                      </FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secretary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Secretary</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treasurer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Treasurer</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="techlead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">
                        Technical lead
                      </FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">
                        Marketing officer
                      </FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fresher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">
                        Fresher representative
                      </FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ocm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">
                        Ordinary committee member
                      </FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              Save
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PositionCard;
