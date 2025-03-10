import lockIcon from "#/lock.svg"
import votingIcon from "#/voting.svg"
import expandUp from "#/expand_circle_up.svg"
import expandDown from "#/expand_circle_down.svg"
import { DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, Drawer } from "../ui/drawer"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"

export enum Status {
    Open = "Open",
    Closed = "Closed",
    NotYetOpen = "Not Yet Open"
}

const FormSchema = z.object({
    candidates: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
    }),
})

export function StatusBar({ status, position, candidates }: { status: Status, position: string, candidates: any[] }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            candidates: [],
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
    }

    if (status === Status.Open) {
        return (
            <Drawer>
                <DrawerTrigger>
                    <div className="fixed left-0 bottom-0 w-full flex justify-between p-2 bg-zinc-950 border-t-1 border-t-zinc-800 cursor-pointer">
                        <img src={votingIcon} />
                        {position}: {status}
                        <img src={expandUp} alt="Expand Icon" />
                    </div>
                </DrawerTrigger>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>President</DrawerTitle>
                                <DrawerDescription>Order the candidates</DrawerDescription>
                            </DrawerHeader>
                            <FormField
                                control={form.control}
                                name="candidates"
                                render={() => (
                                    <FormItem>
                                        {candidates.map((candidate: any) => (
                                            <FormField
                                                key={candidate.studentNumber}
                                                control={form.control}
                                                name="candidates"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={candidate.studentNumber}
                                                            className="flex flex-row items-start  px-4 space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(candidate.studentNumber)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, candidate.studentNumber])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== candidate.studentNumber
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">
                                                                {candidate.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button type="submit">Done</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </form>
                </Form>
            </Drawer>
        )
    } else {
        return (
            <div className="fixed left-0 bottom-0 w-full flex justify-between p-2 bg-zinc-950 border-t-1 border-t-zinc-800">
                <img src={lockIcon} />
                {position}: {status}
                <span></span> {/* Hack to maintain the spacing */}
            </div>
        )
    }
}