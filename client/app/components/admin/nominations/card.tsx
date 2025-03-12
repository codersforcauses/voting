import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Roles =
  | "President"
  | "Vice President"
  | "Secretary"
  | "Treasurer"
  | "Technical Lead"
  | "Marketing Officer"
  | "Fresher Representative"
  | "Ordinary Committee Member";

interface NominationCardProps {
  name: string;
  studentNumber: string;
  expectedGraduationDate: string;
  email: string;
  positionsInterested: Roles[];
  reasonForJoining: string;
  benefitToClub: string;
  initiativesOrEvents: string;
  currentCommittee: string;
  previousCommittee: string;
  canAttendAGM: string;
  messageForAGM: string;
}

const NominationCard = (props: NominationCardProps) => {
  return (
    <Card className="relative gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="absolute grid p-2 pr-0.5 rounded-full cursor-default size-10 top-3 right-3 text-destructive-foreground bg-destructive/10 place-items-center">
              <span className="material-symbols-sharp">person_alert</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Person is not a member to run for committee
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CardHeader>
        <CardTitle>{props.name}</CardTitle>
        <CardDescription>{props.studentNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-xs font-normal leading-snug text-muted-foreground">
          Why do you want to join?
        </span>
        <p className="text-sm">{props.reasonForJoining}</p>
      </CardContent>
    </Card>
  );
};

export default NominationCard;
