import SeatGeneratorCard from "./seat-card";
import NominationCard from "./nomination/card";
import PositionCard from "./position-card";
import RaceCard from "./race-card";

const OverView = () => {
  return (
    <div className="grid h-full gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RaceCard />
      <SeatGeneratorCard />
      <NominationCard />
      <PositionCard />
    </div>
  );
};

export default OverView;
