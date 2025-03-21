import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import type { Candidate } from "@/components/vote/queries";

interface ResultsProps {
    candidate: Candidate;
    stats: any
}
  
const ResultCard = (props: ResultsProps) => {
    return (
        <Card className="relative gap-4">
        <CardHeader>
            <CardTitle>{props.candidate.name}</CardTitle>
            <CardDescription>{props.candidate.student_num}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            {JSON.stringify(props.stats)}
        </CardContent>
        </Card>
    );
};
  
  export default ResultCard;
  