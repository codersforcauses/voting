import * as React from "react";
import { Reorder, useDragControls, useMotionValue } from "motion/react";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Drawer,
} from "../ui/drawer";
import { Button } from "../ui/button";

export enum Status {
  Open = "Open",
  Closed = "Closed",
  NotYetOpen = "Not Yet Open",
}

const ReorderItem = ({
  candidate,
  index,
}: {
  candidate: any;
  index: number;
}) => {
  const y = useMotionValue(0);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={candidate}
      dragListener={false}
      dragControls={controls}
      className="flex items-center px-2 py-1"
      style={{ y }}
    >
      <div
        className="grid px-4 py-1 place-items-center cursor-grab touch-none"
        onPointerDown={(e) => controls.start(e)}
      >
        <span className="material-symbols-sharp">drag_indicator</span>
      </div>
      <div className="flex items-center justify-between w-full">
        <span>{candidate.name}</span>
        <span className="mr-4 text-muted-foreground">{index + 1}</span>
      </div>
    </Reorder.Item>
  );
};

export function StatusBar({
  status,
  position,
  candidates,
}: {
  status: Status;
  position: string;
  candidates: any[];
}) {
  const [order, setOrder] = React.useState(candidates);
  const [drawerIsOpen, setDrawerIsOpen] = React.useState(false);

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    console.log(order);
    setDrawerIsOpen(false);
  };

  if (status === Status.Open) {
    return (
      <Drawer handleOnly open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-0 left-0 flex justify-between w-full p-2 cursor-pointer bg-zinc-950 border-t-1 border-t-zinc-800">
            <span className="material-symbols-sharp">how_to_vote</span>
            {position}: {status}
            <span className="material-symbols-sharp">unfold_more</span>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-mono">{position}</DrawerTitle>
            <DrawerDescription>
              Reorder the candidates from highest preference to lowest.
            </DrawerDescription>
          </DrawerHeader>
          <Reorder.Group
            layoutScroll
            axis="y"
            onReorder={setOrder}
            values={order}
            className="grid gap-1 overflow-y-auto"
          >
            {order.map((candidate, i) => (
              <ReorderItem
                key={candidate.name}
                candidate={candidate}
                index={i}
              />
            ))}
          </Reorder.Group>
          <DrawerFooter>
            <Button onClick={onSubmit}>Done</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <div className="fixed bottom-0 left-0 flex justify-between w-full p-2 bg-zinc-950 border-t-1 border-t-zinc-800">
        <span className="material-symbols-sharp">lock</span>
        {position}: {status}
        <span></span> {/* Hack to maintain the spacing */}
      </div>
    );
  }
}
