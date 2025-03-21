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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Position } from "@/lib/types";
import { useToken } from "@/lib/user";
import { BASE_URL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  positions: z
    .array(
      z.object({
        id: z.number({ coerce: true }).optional(),
        title: z.string().min(2, "Position title is required"),
        description: z.string().min(2, "Position description is required"),
        priority: z.number({ coerce: true }),
        openings: z
          .number({ coerce: true })
          .gte(1, "At least one opening is required"),
      })
    )
    .min(1, "At least one position is required"),
});

type FormSchema = z.infer<typeof formSchema>;

const PositionCard = ({ positions }: { positions: Position[] }) => {
  const token = useToken();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async ({ positions }: FormSchema) => {
      const response = await fetch(`${BASE_URL}/position`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "PATCH",
        body: JSON.stringify(positions),
      });
      const val = await response.json();
      return val;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });

  const defaultValues = {
    positions,
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "positions",
  });

  const empty = {
    id: -(fields.length + 1),
    title: "",
    description: "",
    priority: fields.length + 1,
    openings: 1,
  };

  const onSubmit = async (data: FormSchema) => {
    await mutate(data);
  };

  return (
    <Collapsible className="gap-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="tracking-light">
              Positions Available
            </CardTitle>
            <CardDescription>
              Modify the positions available and how many openings are available
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
                id="position-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => append(empty)}>
                    <span className="material-symbols-sharp text-base!">
                      add
                    </span>
                    Create position
                  </Button>
                </div>
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row gap-4"
                  >
                    <FormField
                      control={form.control}
                      name={`positions.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-mono">Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`positions.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-mono">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex w-full md:w-min gap-4">
                      <FormField
                        control={form.control}
                        name={`positions.${index}.priority`}
                        render={({ field }) => (
                          <FormItem className="w-full md:w-min">
                            <FormLabel className="font-mono">
                              Priority
                            </FormLabel>
                            <FormControl>
                              <Input inputMode="numeric" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`positions.${index}.openings`}
                        render={({ field }) => (
                          <FormItem className="w-full md:w-min">
                            <FormLabel className="font-mono">
                              Openings
                            </FormLabel>
                            <FormControl>
                              <Input inputMode="numeric" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => remove(index)}
                            >
                              <span className="material-symbols-sharp text-base! text-destructive-foreground">
                                delete
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete {item.title}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button
              form="position-form"
              type="submit"
              variant="secondary"
              className="w-full"
            >
              Save
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PositionCard;
