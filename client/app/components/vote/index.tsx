import * as React from "react";
import StatusBar from "./status-bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QUESTIONS from "@/lib/questions";
import {
  useCandidates,
  useCurrentRace,
  usePositions,
  useResults,
  useWS,
} from "./queries";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { Link } from "react-router";
import { useTheme } from "../theme-provider";

const Vote = ({ logout }: { logout: () => void }) => {
  const { setTheme, theme } = useTheme();
  const isDarkMode = theme === "dark";
  const { data: wsData, error } = useWS();
  const [currentRace, refetchCurrentRace] = useCurrentRace();
  const candidates = useCandidates(currentRace?.positions.id);
  const [elected, refetchElected] = useResults(currentRace?.race.id);

  React.useEffect(() => {
    refetchCurrentRace();
  }, [wsData?.race_id, wsData?.status]);
  React.useEffect(() => {
    if (wsData?.status === "finished") refetchElected();
  }, [wsData?.status]);

  return (
    <>
      <header className="flex justify-between py-1 px-4">
        <button onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
          <Logo />
        </button>
        <nav>
          <Button
            className="text-muted-foreground"
            asChild
            variant="link"
            size="sm"
          >
            <Link to="/results">View Results</Link>
          </Button>

          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </nav>
      </header>

      <main className="h-screen p-6 md:p-10">
        <div className="mb-10">
          <div className="text-xs text-gray-400">Now electing:</div>
          <h1 className="text-2xl">{currentRace?.positions.title}</h1>
          <div className="text-sm">{currentRace?.positions.description}</div>
        </div>
        <h2 className="text-md">Nominated Candidates</h2>
        <Accordion type="multiple" className="pb-10">
          {candidates.map(({ name, id, ...data }) => (
            <AccordionItem key={name} value={id.toString()}>
              <AccordionTrigger>
                <div className="text-xl font-semibold flex gap-1">
                  {elected?.find(
                    ({ candidates: { id: elected_id } }) => elected_id === id
                  ) && (
                    <div>
                      {elected?.find(
                        ({ candidates: { id: elected_id } }) =>
                          elected_id === id
                      ) && <div>✰</div>}
                    </div>
                  )}
                  {name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="gap-4 flex flex-col">
                {Object.entries(data)
                  .filter(([key]) => QUESTIONS.find((q) => q.id === key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <div className="text-muted-foreground">
                        {QUESTIONS.find((q) => q.id === key)?.question}
                      </div>
                      <div className="text-base">{value}</div>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
          {candidates.length === 0 && (
            <div className="text-xs text-gray-400">No candidates found</div>
          )}
        </Accordion>
      </main>
      {currentRace && candidates.length > 0 ? (
        <StatusBar
          race_id={currentRace.race.id}
          status={currentRace.race.status}
          position={currentRace?.positions?.title!}
          candidates={candidates}
        />
      ) : (
        <div className="fixed bottom-0 left-0 flex justify-center w-full p-2 cursor-pointer bg-background border-t-1 border-t-border">
          {!currentRace
            ? "Voting not started"
            : candidates.length > 0 && "No candidates"}
        </div>
      )}
    </>
  );
};

export default Vote;
