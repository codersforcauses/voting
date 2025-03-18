import SeatGeneratorCard from "./seat-card";
import NominationCard from "./nomination/card";
import PositionCard from "./position-card";
import RaceCard from "./race-card";

const OverView = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      <RaceCard />
      <NominationCard />
      <SeatGeneratorCard />
      <PositionCard />
    </div>
  );
};

export default OverView;
