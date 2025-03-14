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
import NominationAdd from "./add";

const NominationCard = () => {
  return (
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
  );
};

export default NominationCard;
