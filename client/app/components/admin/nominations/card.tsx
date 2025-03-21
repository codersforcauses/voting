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
import QUESTIONS from "@/lib/questions";

interface NominationCardProps {
  id: number;
  isMember: boolean;
  name: string;
  email: string;
  student_num: string | number;
  graduation: string;
  join_reason: string;
  club_benefit: string;
  initiative: string;
  other_clubs: string;
  past_clubs: string;
  attend: boolean;
  say_something: string;
}

const NominationCard = (props: NominationCardProps) => {
  return (
    <Card className="relative gap-4">
      <TooltipProvider>
        <div className="absolute top-3 right-3 flex gap-2">
          {!props.isMember && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="grid p-2 pr-0.5 rounded-full cursor-default size-10 text-destructive-foreground bg-destructive/10 place-items-center">
                  <span className="material-symbols-sharp">person_alert</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Not currently a CFC member
              </TooltipContent>
            </Tooltip>
          )}
          {!props.attend && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="grid p-2 rounded-full cursor-default size-10 text-muted-foreground bg-muted/50 place-items-center">
                  <span className="material-symbols-sharp">event_busy</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Unable to attend AGM
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
      <CardHeader>
        <CardTitle>{props.name}</CardTitle>
        <CardDescription>{props.student_num}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {Object.entries(props)
          .filter(([key]) => QUESTIONS.find((q) => q.id === key))
          .map(([key, value]) => (
            <div key={key}>
              <div className="text-xs font-normal leading-snug text-muted-foreground">
                {QUESTIONS.find((q) => q.id === key)?.question}
              </div>
              <div className="text-sm">{value}</div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export default NominationCard;
