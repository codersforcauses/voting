import SeatGeneratorCard from "./seat-card";
import NominationCard from "./nomination/card";
import PositionCard from "./position-card";

const OverView = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      <NominationCard />
      <PositionCard />
      <SeatGeneratorCard />
    </div>
  );
};

export default OverView;
