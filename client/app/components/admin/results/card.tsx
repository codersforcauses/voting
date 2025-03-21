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
    stats: {[key: number]: number }[]
}
  
const ResultCard = (props: ResultsProps) => {
    return (
        <Card className="relative gap-4">
        <CardHeader>
            <CardTitle>{props.candidate.name}</CardTitle>
            <CardDescription>{props.candidate.student_num}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="font-mono text-sm text-muted-foreground mb-2">Voting Preferences Received</div>
            <div className="flex gap-2">
                {props.stats.map((pref, i) => (
                    <div className="bg-foreground text-background aspect-square flex items-end justify-around w-12">
                        <div className="text-3xs text-muted-foreground">{Object.entries(pref)[0][0]}</div>
                        <div className="text-3xl">{Object.entries(pref)[0][1]}</div>
                    </div>
                ))}
            </div>
        </CardContent>
        </Card>
    );
};
  
  export default ResultCard;
  