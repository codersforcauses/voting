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

const OverView = () => {
  return (
    <div>
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
    </div>
  );
};

export default OverView;
