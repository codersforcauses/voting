import { candidates } from "@/mocks/candidate";
import NominationCard from "./card";

const Nominations = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((data) => (
        <NominationCard key={data.name} {...data} />
      ))}
    </div>
  );
};

export default Nominations;
