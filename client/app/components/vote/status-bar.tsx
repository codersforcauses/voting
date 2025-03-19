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
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

type Status = "open" | "closed" | "finished";

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

const StatusBar = ({
  race_id,
  status,
  position,
  candidates,
}: {
  race_id: number | string;
  status: Status;
  position: string;
  candidates: any[];
}) => {
  const token = useToken();
  const data = candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
  }));
  const [id, setID] = React.useState<string | number>();
  const [order, setOrder] = React.useState<
    {
      id: string | number;
      name: string;
    }[]
  >([]);
  const [drawerIsOpen, setDrawerIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (id !== race_id && drawerIsOpen) {
      setID(race_id);
      setOrder(data);
    }
  }, [id, race_id, data, drawerIsOpen]);

  const voteMutation = useMutation({
    mutationKey: ["vote", position],
    mutationFn: async (order: any) => {
      const res = await fetch(`${BASE_URL}/vote/${race_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });
      return res;
    },
  });

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    voteMutation.mutateAsync(order);
    setDrawerIsOpen(false);
  };

  if (status === "open") {
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
              <ReorderItem key={candidate.id} candidate={candidate} index={i} />
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
};

export default StatusBar;
