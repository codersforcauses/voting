import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import NominationAdd from "./nomination/add";
import SeatGenerator from "./seat";

const OverView = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Nominations</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Nomination</Button>
            </DialogTrigger>
            <NominationAdd />
          </Dialog>
        </CardContent>
      </Card>
      <SeatGenerator />
    </div>
  );
};

export default OverView;
