import lockIcon from "#/lock.svg"
import expandUp from "#/expand_circle_up.svg"
import expandDown from "#/expand_circle_down.svg"
import { DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, Drawer } from "../ui/drawer"

export function StatusBar() {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="absolute left-0 bottom-0 w-full flex justify-between p-2 bg-zinc-950 border-2 border-t-zinc-900 cursor-pointer">
                    <img src={lockIcon} alt="Locked" />
                    President: Not Yet Open
                    <img src={expandUp} alt="Expand Icon" />
                </div>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>President</DrawerTitle>
                    <DrawerDescription>Order the candidates</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <DrawerClose>
                        Done
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>        
    )
}